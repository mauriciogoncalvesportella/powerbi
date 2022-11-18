import {Inject, Injectable} from "@nestjs/common";
import {format} from "date-fns";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection, EntityManager, In} from "typeorm";
import {DateValueUtils} from "../utils/date-value.utils";
import { IRevenueQueries, QueryResultDailyRevenue, QueryResultResumeRevenue } from './revenue.generator'
import {DateOrYearMonthParam} from "../sales.types";

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

  private async getDates (yearMonth: string) {
    return DateValueUtils.yearMonthBound(yearMonth, await this.requestMetadata.dtFechamento()).map(date => format(date, 'yyyy-MM-dd'))
  }

  public async daily (sellers: number[], yearMonth: string, dailyGoal: number): Promise<QueryResultDailyRevenue[]> {
    /*
    SELECT TO_CHAR(data, 'yyyy-mm-dd') as date,
      sum(case when (vp."fgSituacao" = 1 and vp."dtEmissao" = data) then vp."vlProdutos" else 0 end)::float as not_billed,
      sum(case when (vp."fgSituacao" = 5 and vp."dtEntrega" = data) then vp."vlProdutos" else 0 end)::float as billed,
      case when extract(isodow from data) in (6, 7) then 0 else :dailyGoal::float end as goal
    FROM (select * from generate_series(:date0::timestamp, :date1::timestamp, '1 day') as data) as datas
      left join ${this.tenant}.vd_pedidos as vp on (vp."dtEntrega" = data or vp."dtEmissao" = data) and vp."cdVendedor" in (:...sellers) and vp."idMesAno" = :yearMonth
    group by data
    order by data`,
    */
    const dates = await this.getDates(yearMonth)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      SELECT TO_CHAR(data, 'yyyy-mm-dd') as date,
        sum(case when (vp."fgSituacao" = 1) then vp."vlProdutos" else 0 end)::float as not_billed,
        sum(case when (vp."fgSituacao" in (2,4,5) ) then vp."vlProdutos" else 0 end)::float as billed,
        :dailyGoal::float as goal
      FROM (select * from generate_series(:date0::timestamp, :date1::timestamp, '1 day') as data) as datas
        left join ${this.tenant}.vd_pedidos as vp on (vp."dtEmissao" = data) and vp."cdVendedor" in (:...sellers) and vp."idMesAno" = :yearMonth
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
      SELECT
        date,
        sum(not_billed) over (order by date asc rows between unbounded preceding and current row) as not_billed,
        sum(billed) over (order by date asc rows between unbounded preceding and current row) as billed,
        sum(goal) over (order by date asc rows between unbounded preceding and current row) as goal
      FROM (
        SELECT TO_CHAR(data, 'yyyy-mm-dd') as date,
          sum(case when (vp."fgSituacao" = 1) then vp."vlProdutos" else 0 end)::float as not_billed,
          sum(case when (vp."fgSituacao" in (2,4,5)) then vp."vlProdutos" else 0 end)::float as billed,
          case when extract(isodow from data) in (6, 7) then 0 else :dailyGoal::float end as goal
        FROM (select * from generate_series(:date0::timestamp, :date1::timestamp, '1 day') as data) as datas
          left join ${this.tenant}.vd_pedidos as vp on vp."dtEmissao" = data and vp."cdVendedor" in (:...sellers)
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
          sum(case when (vp."fgSituacao" in (2,4,5)) then vp."vlProdutos" else 0 end) AS billed
        FROM ${this.tenant}.vd_pedidos VP
          JOIN ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor"
          JOIN ${this.tenant}.cad_equipe ce on ce.cd = cv."cdEquipe"
        WHERE (vp."dtEmissao" between :date0 and :date1) and ce."idEquipe" similar to :regexArray
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
      SELECT cv.cd AS code,
        cv."nmVendedor" AS label,
        sum(case when vp."fgSituacao" in (2,4,5) then "vlProdutos" else 0 end)::float AS billed,
        sum(case when vp."fgSituacao" = 1 then "vlProdutos" else 0 end)::float AS not_billed,
        'seller' AS type,
        0::float AS GOAL
      FROM ${this.tenant}.vd_pedidos vp
        join ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor" and cv.cd in (:...cds)
      WHERE (vp."dtEmissao" between :date0 and :date1) 
      GROUP BY cv.cd, cv."nmVendedor"
      `,
      { cds, date0, date1}, {}
    )
    return await this.manager.query(query, parameters) as QueryResultResumeRevenue[]
  }

  public async resume (teamCode: number, dateOryearMonth: DateOrYearMonthParam) {
    const { dateParam, yearMonthParam } = dateOryearMonth
    const { idEquipe: teamId } = await this.connection.manager.findOneOrFail(CadEquipeEntity, teamCode)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
    `
    SELECT *
    FROM (
      SELECT
        ce.cd AS code,
        ce."nmEquipe" AS label,
        COALESCE(sum(case when (t."fgSituacao" = 1) then t."vlProdutos" else 0 end), 0)::float as not_billed,
        COALESCE(sum(case when (t."fgSituacao" IN (2,5)) then t."vlProdutos" else 0 end), 0)::float as billed,
        count(*) AS order_count,
        'team' AS type
        FROM (
          SELECT vp.*, ce.*, cv."cdEquipe" AS "cd_equipe_vendedor"
            FROM ${this.tenant}.vd_pedidos vp
              JOIN ${this.tenant}.cad_vendedor cv ON cv.cd = vp."cdVendedor"
              JOIN ${this.tenant}.cad_equipe ce ON ce.cd = cv."cdEquipe"
          WHERE (vp."idMesAno" = :yearMonth OR (vp."dtEmissao" between :date0 and :date1)) and vp."fgSituacao" IN (1,2,4,5) AND ce."idEquipe" LIKE :teamId || '%') t
          JOIN ${this.tenant}.cad_equipe ce ON ce."cdEquipePai" = :teamCode
        WHERE t."idEquipe" like ce."idEquipe" || '%'
        GROUP BY ce.cd, ce."idEquipe", ce."nmEquipe"
        
      UNION
      
      SELECT
        cv.cd AS code,
        cv."nmVendedor" AS label,
        SUM("vlCusto")::float AS cost_value,
        SUM("vlLucro")::float AS profit_value,
        COALESCE(sum(case when ("fgSituacao" = 1) then "vlProdutos" else 0 end), 0)::float as not_billed,
        COALESCE(sum(case when ("fgSituacao" IN (2,4,5)) then "vlProdutos" else 0 end), 0)::float as billed,
        COUNT(*) AS order_count,
        'seller' AS type
        FROM ${this.tenant}.vd_pedidos vp
          JOIN ${this.tenant}.cad_vendedor cv ON cv.cd = vp."cdVendedor"
      WHERE (vp."idMesAno" = :yearMonth OR vp."dtEmissao" between :date0 and :date1) and vp."fgSituacao" IN (1,2,4,5) AND cv."cdEquipe" = :teamCode
      GROUP BY cv.cd, cv."nmVendedor") result
    ORDER BY billed DESC
    `,
    { yearMonth: yearMonthParam, teamCode, teamId, date0: dateParam[0], date1: dateParam[1] },
    { })
    return await this.connection.manager.query(query, parameters)
  }
}
