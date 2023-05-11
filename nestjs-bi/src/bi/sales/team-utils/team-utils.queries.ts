import { MultitenantConnection } from "src/database/multitenant-connection";
import { ChildTeamsQueryResult, SellersQueryResult, TeamUtilsRepository } from "./team-utils.interfaces";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TeamUtilsQueries implements TeamUtilsRepository {
  constructor (
    private multitenant: MultitenantConnection
  ) { }

  async getSellersFromTeam (teamCode: number): Promise<SellersQueryResult[]> {
    return await this.multitenant.queryExecute(
    `
      select
        cd as code,
        "cdEquipe" as team_code,
        "idVendedor" as id,
        "nmVendedor" as label,
        "idEmail" as email,
        "idLogin" as id_login,
        "fgAtivo" as enabled,
        "fgFuncao" as role
      from ${this.multitenant.tenant}.cad_vendedor
      where "cdEquipe" = :teamCode
    `, { teamCode })
  }

  async getSellers (): Promise<SellersQueryResult[]> {
    return await this.multitenant.queryExecute(
    `
      select
        cd as code,
        "cdEquipe" as teamCode,
        "idVendedor" as id,
        "nmVendedor" as label,
        "idEmail" as email,
        "idLogin" as idLogin,
        "fgAtivo" as enabled,
        "role" as role
      from ${this.multitenant.tenant}.cad_vendedor
    `, {})
  }

  async getChildTeams(rootTeam: number): Promise<ChildTeamsQueryResult[]> {
    return await this.multitenant.queryExecute(
      `
      with parent_teams as (
        select *
          from ${this.multitenant.tenant}.cad_equipe ce3
          where ce3."cdEquipePai" = :code or ce3.cd = :code
      )
      select
        ce.cd as code,
        ce."nmEquipe" as label,
        ce."idEquipe" as team_id,
        ce."cdResponsavel" as seller_leader_code,
        pt.cd as parent_team_code
      from parent_teams pt
      join ${this.multitenant.tenant}.cad_equipe ce
        on (ce."idEquipe" like pt."idEquipe"||'%' and pt.cd = :code and ce."cdEquipePai" = pt.cd)
        or (ce."idEquipe" like pt."idEquipe"||'%' and pt.cd != ce.cd and pt.cd != :code)
        or (ce."cd" = :code and pt.cd = :code)
      `,
      { code: rootTeam },
    )
  }
}