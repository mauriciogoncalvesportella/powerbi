import {Inject} from "@nestjs/common";
import {format} from "date-fns";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection} from "typeorm";
import {DateOrYearMonthParam} from "../sales.types";
import {DateValueUtils} from "../utils/date-value.utils";
import {IProfitQueries, QueryResultDailyProfit, QueryResultResumeProfit} from "./profit.interfaces";

export class ProfitQueries implements IProfitQueries {
  constructor (
    @Inject('CONNECTION')
    private connection: Connection,
    private requestMetadata: RequestMetadata 
  ) {}

  get tenant () {
    return `ten_${this.connection.name}`
  }

  get manager () {
    return this.connection.manager
  }

  private async getDates (yearMonth: string) {
    return DateValueUtils.yearMonthBound(yearMonth, await this.requestMetadata.dtFechamento())
      .map(date => format(date, 'yyyy-MM-dd'))
  }

  private async getSellerCodeOrTeamId (cd: number, type: 'team' | 'seller'): Promise<{ teamId: string, sellerCode: number }> {
    const sellerCode = type === 'seller' ? cd : -1
    let teamId = 'impossible'
    if (type === 'team') {
      ({ idEquipe: teamId } = await this.connection.manager.findOneOrFail(CadEquipeEntity, cd))
    }
    return {
      sellerCode,
      teamId
    }
  }

  async daily (cd: number, type: 'team' | 'seller', yearMonth: string): Promise<QueryResultDailyProfit[]> {
    const { sellerCode, teamId } = await this.getSellerCodeOrTeamId(cd, type)
    const dates = await this.getDates(yearMonth)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      SELECT TO_CHAR(data, 'yyyy-mm-dd') AS date,
          COALESCE(sum("vlCusto"), 0::float) as cost_value,
          COALESCE(sum("vlLucro"), 0::float) as profit_value,
          COALESCE(sum(case when (vp."fgSituacao" = 1) then (vp."vlProdutos" - vp."vlDesconto") else 0 end), 0)::float as not_billed,
          COALESCE(sum(case when (vp."fgSituacao" IN (2,4,5)) then (vp."vlProdutos" - vp."vlDesconto") else 0 end), 0)::float as billed
        FROM (select generate_series(:date0::timestamp, :date1::timestamp, '1 day') as data) as datas
          JOIN ${this.tenant}.cad_vendedor cv on true
          JOIN ${this.tenant}.cad_equipe ce on ce.cd = cv."cdEquipe"
          LEFT JOIN ${this.tenant}.vd_pedidos vp on vp."dtEmissao" = data and vp."cdVendedor" = cv.cd AND vp."idMesAno" = :yearMonth AND vp."fgSituacao" IN (1,2,4,5)
          where (cv.cd = :sellerCode or vp."cdVendedor2" = :sellerCode or ce."idEquipe" like :teamId||'%')
      GROUP BY data
      ORDER BY data
      `,
      { yearMonth, date0: dates[0], date1: dates[1], sellerCode, teamId },
      {}
    )

    return await this.connection.manager.query(query, parameters)
  }

  async dailyCumulative (cd: number, type: 'team' | 'seller', yearMonth: string): Promise<QueryResultDailyProfit[]> {
    const { sellerCode, teamId } = await this.getSellerCodeOrTeamId(cd, type)
    const dates = await this.getDates(yearMonth)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      SELECT
        date,
        SUM(cost_value) OVER (order by date asc rows between unbounded preceding and current row) cost_value,
        SUM(profit_value) OVER (order by date asc rows between unbounded preceding and current row) profit_value,
        SUM(billed) OVER (order by date asc rows between unbounded preceding and current row) billed,
        SUM(not_billed) OVER (order by date asc rows between unbounded preceding and current row) not_billed
        from (
          SELECT TO_CHAR(data, 'yyyy-mm-dd') AS date,
              COALESCE(sum("vlCusto"), 0::float) as cost_value,
              COALESCE(sum("vlLucro"), 0::float) as profit_value,
              COALESCE(sum(case when (vp."fgSituacao" = 1) then (vp."vlProdutos" - vp."vlDesconto") else 0 end), 0)::float as not_billed,
              COALESCE(sum(case when (vp."fgSituacao" IN (2,4,5)) then (vp."vlProdutos" - vp."vlDesconto") else 0 end), 0)::float as billed
            FROM (select generate_series(:date0::timestamp, :date1::timestamp, '1 day') as data) as datas
              JOIN ${this.tenant}.cad_vendedor cv on true
              JOIN ${this.tenant}.cad_equipe ce on ce.cd = cv."cdEquipe"
              LEFT JOIN ${this.tenant}.vd_pedidos vp on vp."dtEmissao" = data and vp."cdVendedor" = cv.cd AND vp."idMesAno" = :yearMonth AND vp."fgSituacao" IN (1,2,4,5)
            where (cv.cd = :sellerCode or ce."idEquipe" like :teamId||'%')
          GROUP BY data
          ORDER BY data
        ) as t
      `,
      { yearMonth, date0: dates[0], date1: dates[1], sellerCode, teamId },
      {}
    )
    return await this.connection.manager.query(query, parameters)
  }

  async resume (teamCode: number, dateOryearMonth: DateOrYearMonthParam): Promise<QueryResultResumeProfit[]> {
    const { dateParam, yearMonthParam } = dateOryearMonth
    const { idEquipe: teamId } = await this.connection.manager.findOneOrFail(CadEquipeEntity, teamCode)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
    `
    SELECT *
    FROM (
      SELECT
        ce.cd AS code,
        ce."nmEquipe" AS label,
        sum(t."vlCusto")::float AS cost_value,
        sum(t."vlLucro")::float AS profit_value,
        COALESCE(sum(case when (t."fgSituacao" = 1) then (t."vlProdutos" - t."vlDesconto") else 0 end), 0)::float as not_billed,
        COALESCE(sum(case when (t."fgSituacao" IN (2,4,5)) then (t."vlProdutos" - t."vlDesconto") else 0 end), 0)::float as billed,
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
        code,
        label,
        SUM(cost_value),
        SUM(profit_value),
        SUM(not_billed),
        SUM(billed),
        SUM(order_count),
        type
      FROM
        (SELECT
          cv.cd AS code,
          cv."nmVendedor" AS label,
          SUM("vlCusto")::float AS cost_value,
          SUM("vlLucro")::float AS profit_value,
          COALESCE(sum(case when ("fgSituacao" = 1) then ("vlProdutos" - "vlDesconto") else 0 end), 0)::float as not_billed,
          COALESCE(sum(case when ("fgSituacao" IN (2,4,5)) then ("vlProdutos" - "vlDesconto") else 0 end), 0)::float as billed,
          COUNT(*) AS order_count,
          'seller' AS type
          FROM ${this.tenant}.vd_pedidos vp
            JOIN ${this.tenant}.cad_vendedor cv ON cv.cd = vp."cdVendedor"
        WHERE (vp."idMesAno" = :yearMonth OR vp."dtEmissao" between :date0 and :date1) and vp."fgSituacao" IN (1,2,4,5) AND cv."cdEquipe" = :teamCode
        GROUP BY cv.cd, cv."nmVendedor"

        UNION

        SELECT
          cv.cd AS code,
          cv."nmVendedor" AS label,
          SUM("vlCusto")::float AS cost_value,
          SUM("vlLucro")::float AS profit_value,
          COALESCE(sum(case when ("fgSituacao" = 1) then ("vlProdutos" - "vlDesconto") else 0 end), 0)::float as not_billed,
          COALESCE(sum(case when ("fgSituacao" IN (2,4,5)) then ("vlProdutos" - "vlDesconto") else 0 end), 0)::float as billed,
          COUNT(*) AS order_count,
          'seller' AS type
          FROM ${this.tenant}.vd_pedidos vp
            JOIN ${this.tenant}.cad_vendedor cv ON cv.cd = vp."cdVendedor2"
        WHERE (vp."idMesAno" = :yearMonth OR vp."dtEmissao" between :date0 and :date1) and vp."fgSituacao" IN (1,2,4,5) AND cv."cdEquipe" = :teamCode
        GROUP BY cv.cd, cv."nmVendedor") sellerResult
      GROUP BY code, label, type
    ) result
    ORDER BY billed DESC
    `,
    { yearMonth: yearMonthParam, teamCode, teamId, date0: dateParam[0], date1: dateParam[1] },
    { })
    return await this.connection.manager.query(query, parameters)
  }
}
