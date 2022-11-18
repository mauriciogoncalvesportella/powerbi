import {Inject, Injectable} from "@nestjs/common";
import {format} from "date-fns";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection} from "typeorm";
import {DateOrYearMonthParam} from "../sales.types";
import {DateValueUtils} from "../utils/date-value.utils";
import {IDropdownQueries, QueryResultSeller, QueryResultTeam } from "./team-drop-down.types";

@Injectable()
export class TeamDropdownQueries implements IDropdownQueries {
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

  async getSellers (code: number, interval: string[]): Promise<QueryResultSeller[]> {
    const teamEntity = await this.manager.findOneOrFail(CadEquipeEntity, { where: { cd: code } })
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
        SELECT
          cv."cd" AS seller_code,
          cv."nmVendedor" AS seller_name,
          ce."cd" AS team_code,
          ce."idEquipe" AS team_id
            FROM ${this.tenant}.vd_pedidos vp
              JOIN ${this.tenant}.cad_vendedor cv ON cv.cd = vp."cdVendedor"
              JOIN ${this.tenant}.cad_equipe ce ON ce.cd = cv."cdEquipe"
        WHERE ce."idEquipe" like (:teamId || '%') AND (vp."idMesAno" BETWEEN :yearMonth0 AND :yearMonth1) AND vp."fgSituacao" IN (1,2,4,5) 
        GROUP BY cv."cd", ce."cd", cv."nmVendedor", ce."idEquipe"
        ORDER BY ce."idEquipe", cv."nmVendedor"
      `,
      { teamId: teamEntity.idEquipe, yearMonth0: interval[0], yearMonth1: interval[1] },
      {}
    )
    return await this.connection.manager.query(query, parameters)
  }

  async getTeams (code: number): Promise<QueryResultTeam[]> {
    const teamEntity = await this.manager.findOneOrFail(CadEquipeEntity, { where: { cd: code } })
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
        SELECT
          ce."cd" as team_code,
          ce."idEquipe" as team_id,
          ce."nmEquipe" as team_name,
          ce."cdEquipePai" as parent_team_code
            FROM ${this.tenant}.cad_equipe ce
        WHERE ce."idEquipe" like (:teamId || '%')
        ORDER BY ce."idEquipe"
      `,
      { teamId: teamEntity.idEquipe },
      {}
    )
    return await this.connection.manager.query(query, parameters)
  }
}
