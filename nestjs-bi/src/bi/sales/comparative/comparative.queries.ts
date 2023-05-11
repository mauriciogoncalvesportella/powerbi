import { Inject, Injectable, OnApplicationBootstrap, OnModuleInit } from "@nestjs/common";
import { ComparativeRepository, QueryResultOrdersByMonth, QueryResultOrdersByMonthExpanded } from "./comparative.interfaces";
import { Connection } from "typeorm";
import { TeamUtilsService } from "../team-utils/team-utils.service";

@Injectable()
export class ComparativeQueries implements ComparativeRepository {
  constructor (
    @Inject('CONNECTION')
    private connection: Connection,
    private teamUtilsService: TeamUtilsService,
  ) { }

  get tenant () {
    return `ten_${this.connection.name}`
  }

  public async ordersByMonthExpanded (teamCode: number, yearMonths: string[]): Promise<QueryResultOrdersByMonthExpanded[]> {
    const team = await this.teamUtilsService.getTeam(teamCode)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
        select
          ce."cd" as team_code,
          ce."idEquipe" as team_id,
          cv.cd as seller_code,
          vp."idMesAno" as year_month,
          (SUBSTRING(vp."idMesAno" from 6)::int - 1) as month,
          COALESCE(sum("vlCusto"), 0)::float as cost_value,
          COALESCE(sum("vlLucro"), 0)::float as profit_value,
          COALESCE(sum("vlProdutos" - vp."vlDesconto"), 0)::float as revenue
        from ${this.tenant}.vd_pedidos vp
          join ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor"
          join ${this.tenant}.cad_equipe ce on ce.cd = cv."cdEquipe"
        where vp."fgSituacao" in (1,2,4,5) and vp."idMesAno" in (:...yearMonths) and (ce."idEquipe" like :teamId||'%')
        group by ce."cd", ce."idEquipe", cv."cd", vp."idMesAno"
      `,
      { yearMonths, teamId: team.idEquipe },
      {}
    )

    return await this.connection.manager.query(query, parameters)
  }

  async ordersByMonth (code: number, type: "seller" | "team", yearMonths: string[]): Promise<QueryResultOrdersByMonth[]> {
    const teamOrSeller = await this.teamUtilsService.getSellerCodeOrTeamId(code, type)
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
        select
          vp."idMesAno" as year_month,
          (SUBSTRING(vp."idMesAno" from 6)::int - 1) as month,
          COALESCE(sum("vlCusto"), 0::float) as cost_value,
          COALESCE(sum("vlLucro"), 0::float) as profit_value,
          COALESCE(sum("vlProdutos" - vp."vlDesconto"), 0)::float as revenue
        from ${this.tenant}.vd_pedidos vp
          join ${this.tenant}.cad_vendedor cv on cv.cd = vp."cdVendedor"
          join ${this.tenant}.cad_equipe ce on ce.cd = cv."cdEquipe"
        where vp."fgSituacao" in (1,2,4,5) and vp."idMesAno" in (:...yearMonths) and (ce."idEquipe" like :teamId||'%' or cv.cd = :sellerCode)
        group by ce."cd", ce."idEquipe", cv."cd", vp."idMesAno"
      `,
      { yearMonths, teamId: teamOrSeller.teamId, sellerCode: teamOrSeller.sellerCode },
      {}
    )

    return await this.connection.manager.query(query, parameters)
  }
}