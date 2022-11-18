import {Inject, Injectable} from "@nestjs/common";
import {format} from "date-fns";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection, EntityManager, In} from "typeorm";
import {DateValueUtils} from "../utils/date-value.utils";
import { IRevenueQueries, QueryResultDailyRevenue, QueryResultResumeRevenue } from './revenue.generator'

@Injectable()
export class RevenueQueries implements IRevenueQueries {
  protected manager: EntityManager

  constructor(
    @Inject('CONNECTION')
    public connection: Connection,
    public requestMetadata: RequestMetadata,
  ) {
    this.manager = connection.manager
  }
  
  get tenant () {
    return `ten_${this.connection.name}`
  }

  private async getDates (yearMonth: string, dates?: string[]) {
    return dates ?? DateValueUtils.yearMonthBound(yearMonth, await this.requestMetadata.dtFechamento()).map(date => format(date, 'yyyy-MM-dd'))
  }

  public async daily (sellers: number[], yearMonth: string, dailyGoal: number): Promise<QueryResultDailyRevenue[]> {
    const dates = await this.getDates(yearMonth)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      --- Raw Query
      SELECT TO_CHAR(data, 'yyyy-mm-dd') as date,
        sum(case when (vp."fgSituacao" = 1 and vp."dtEmissao" = data) then vp."vlProdutos" else 0 end)::float as not_billed,
        sum(case when (vp."fgSituacao" = 5 and vp."dtEntrega" = data) then vp."vlProdutos" else 0 end)::float as billed,
        case when extract(isodow from data) in (6, 7) then 0 else :dailyGoal::float end as goal
      FROM (select * from generate_series(:date0::timestamp, :date1::timestamp, '1 day') as data) as datas
        left join ${this.tenant}.vd_pedidos as vp on (vp."dtEntrega" = data or vp."dtEmissao" = data) and vp."cdVendedor" in (:...sellers) and vp."idMesAno" = :yearMonth
      group by data
      order by data`,
      { yearMonth, date0: dates[0], date1: dates[1], sellers, dailyGoal },
      {}
    )
    return await this.manager.query(query, parameters)
  }

  public async dailyCumulative (sellers: number[], yearMonth: string, dailyGoal: number, monthlyGoal: number): Promise<QueryResultDailyRevenue[]> {
    const dates = await this.getDates(yearMonth)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      --- Raw Query
      SELECT
        date,
        sum(not_billed) over (order by date asc rows between unbounded preceding and current row) as not_billed,
        sum(billed) over (order by date asc rows between unbounded preceding and current row) as billed,
        sum(goal) over (order by date asc rows between unbounded preceding and current row) as goal
      FROM (
        SELECT TO_CHAR(data, 'yyyy-mm-dd') as date,
          sum(case when (vp."fgSituacao" = 1 and vp."dtEmissao" = data) then vp."vlProdutos" else 0 end)::float as not_billed,
          sum(case when (vp."fgSituacao" = 5 and vp."dtEntrega" = data) then vp."vlProdutos" else 0 end)::float as billed,
          case when extract(isodow from data) in (6, 7) then 0 else :dailyGoal::float end as goal
        FROM (select * from generate_series(:date0::timestamp, :date1::timestamp, '1 day') as data) as datas
          left join ${this.tenant}.vd_pedidos as vp on (vp."dtEntrega" = data or vp."dtEmissao" = data) and vp."cdVendedor" in (:...sellers) and vp."idMesAno" = :yearMonth
        group by data
        order by data) T`,
      { yearMonth, date0: dates[0], date1: dates[1], sellers, dailyGoal },
      {}
    )
    const resultQuery = await this.manager.query(query, parameters) as QueryResultDailyRevenue[]
    resultQuery[resultQuery.length - 1].goal = monthlyGoal 
    return resultQuery
  }

  public async resumeByTeams (cds: number[], dates: Date[]) {
    const [date0, date1] = dates.map(date => format(date, 'yyyy-MM-dd'))
    const ids = (await this.manager.find(CadEquipeEntity, { where: { cd: In(cds) } })).map(entity => entity.idEquipe)
    const regex = ids.join('|').replace('.', '\\.')
    const regexArray = ids.map(id => `%${id}%`).join('|').replace('.', '\\.')
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      --- RAW QUERY
      SELECT ce2.cd AS code,
        ce2."nmEquipe" AS label,
        sum(billed)::float AS billed,
        sum(not_billed)::float AS not_billed,
        'team' AS type,
        0::float AS goal
      FROM (
        SELECT
          substring("idEquipe" from :regex) as label,
          sum(case when (vp."fgSituacao" = 1) then vp."vlProdutos" else 0 end) AS not_billed,
          sum(case when (vp."fgSituacao" = 5) then (vp."vlProdutos") else 0 end) AS billed
        FROM ${this.tenant}.vd_pedidos VP
          JOIN ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor"
          JOIN ${this.tenant}.cad_equipe ce on ce.cd = cv."cdEquipe"
        WHERE (vp."dtEntrega" between :date0 and :date1) and ce."idEquipe" similar to :regexArray
        GROUP BY ce."idEquipe") t
        JOIN ${this.tenant}.cad_equipe ce2 on label = ce2."idEquipe"
      GROUP BY ce2.cd, ce2."nmEquipe"
      `,
      { regex, regexArray, date0, date1 }, {}
    )
    const resultQuery = await this.connection.query(query, parameters) as QueryResultResumeRevenue[]
    return resultQuery
  }

  public async resumeBySellers (cds: number[], dates: Date[]) {
    const [date0, date1] = dates.map(date => format(date, 'yyyy-MM-dd'))
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      --- RAW QUERY
      select cv.cd AS code,
        cv."nmVendedor" AS label,
        sum(case when vp."fgSituacao" = 5 then "vlProdutos" else 0 end)::float AS billed,
        sum(case when vp."fgSituacao" = 1 then "vlProdutos" else 0 end)::float AS not_billed,
        'seller' AS type,
        0::float AS GOAL
      from ${this.tenant}.vd_pedidos vp
        join ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor" and cv.cd in (:...cds)
      WHERE vp."dtEntrega" between :date0 and :date1
      GROUP BY cv.cd, cv."nmVendedor"
      `,
      { cds, date0, date1}, {}
    )
    return await this.manager.query(query, parameters) as QueryResultResumeRevenue[]
  }
}
