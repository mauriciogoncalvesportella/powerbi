import {Inject} from "@nestjs/common";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection} from "typeorm";
import {IComparativeQueries, QueryResultComparative} from "./comparative.types";

export class ComparativeQueries implements IComparativeQueries {
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

  async comparativeTeam (teamCode: number, interval: string[]): Promise<QueryResultComparative[]> {
    const { idEquipe: teamId } = await this.manager.findOneOrFail(CadEquipeEntity, { where: { cd: teamCode } })
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      with amount as (
        /* Busca o faturamento das equipes filhas (e aninhadas) da equipe solicitada */
        select
          case when vp."fgSituacao" IN (2,4,5) then 'billed' else 'not_billed' end as status,
          ce."idEquipe" as team_id,
          "idMesAno",
          coalesce (sum(vp."vlProdutos"), 0)::float as market_value,
          coalesce (sum(vp."vlCusto"), 0)::float as cost_value,
          coalesce (sum(vp."vlLucro"), 0)::float as profit_value
          from ${this.tenant}.vd_pedidos vp
            join ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor"
            join ${this.tenant}.cad_equipe ce on ce.cd = cv."cdEquipe"
          where vp is null or (vp."fgSituacao" in (1,2,4,5)  and ce."idEquipe" like  :teamId||'.%' and vp."idMesAno" between :interval0 and :interval1)
          group by ce."idEquipe", vp."fgSituacao", "idMesAno"
        order by "idMesAno"
      )
      /* Remove o aninhamento e organiza o faturamento pelo idMesAno */
      select
        ta."status",
        ta."idMesAno" as year_month,
        ce."cd" as code,
        'team' as type,
        ce."nmEquipe" as label,
        sum(market_value)::float as market_value,
        sum(cost_value)::float as cost_value,
        sum(profit_value)::float as profit_value
          from ${this.tenant}.cad_equipe ce, amount ta
          where ce."cdEquipePai" = :teamCode and ta."team_id" like ce."idEquipe"||'%'
        group by status, ta."idMesAno", ce.cd, ce."idEquipe", ce."nmEquipe"
        
      UNION

      select
        case when vp."fgSituacao" IN (2,4,5) then 'billed' else 'not_billed' end as status,
        vp."idMesAno" as year_month,
        cv.cd as code,
        'seller' as type,
        INITCAP(coalesce (cv."idLogin", cv."nmVendedor")) as label,
        coalesce (sum(vp."vlProdutos"), 0)::float as market_value,
        coalesce (sum(vp."vlCusto"), 0)::float as cost_value,
        coalesce (sum(vp."vlLucro"), 0)::float as profit_value
        from ${this.tenant}.vd_pedidos vp
          join ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor" and cv."cdEquipe" = :teamCode
        where (vp."fgSituacao" in (1,2,4,5) and vp."idMesAno" between :interval0 and :interval1)
        group by "fgSituacao", vp."idMesAno", cv.cd, cv."nmVendedor"
      order by year_month, market_value
      `,
      { teamId, teamCode, interval0: interval[0], interval1: interval[1] },
      {}
    )
    return await this.connection.manager.query(query, parameters)
  }

  async comparativeSeller (sellerCode: number, interval: string[]): Promise<QueryResultComparative[]> {
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      select
        case when vp."fgSituacao" IN (2,4,5) then 'billed' else 'not_billed' end as status,
        vp."idMesAno" as year_month,
        cv.cd as code,
        'seller' as type,
        INITCAP(coalesce (cv."idLogin", cv."nmVendedor")) as label,
        coalesce (sum(vp."vlProdutos"), 0)::float as market_value,
        coalesce (sum(vp."vlCusto"), 0)::float as cost_value,
        coalesce (sum(vp."vlLucro"), 0)::float as profit_value
        from ${this.tenant}.vd_pedidos vp
          join ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor" and cv.cd = :sellerCode
        where (vp."fgSituacao" in (1,2,4,5) and vp."idMesAno" between :interval0 and :interval1)
        group by "fgSituacao", vp."idMesAno", cv.cd, cv."nmVendedor"
      order by year_month, market_value
      `,
      { sellerCode, interval0: interval[0], interval1: interval[1] },
      {}
    )
    return await this.connection.manager.query(query, parameters)
  }
}
