import { Inject, Injectable } from "@nestjs/common";
import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import { Connection, EntityManager } from 'typeorm'

export interface AllUsersQueryResult {
  code: number,
  name: string,
  email: string,
  active: boolean,
  role: number,
  login_id: string,
  password_created: boolean,
  team_code: number,
  team_id: string,
  team_name: string
}

@Injectable()
export class UserStatusQueries {
  private manager: EntityManager
  constructor (
    @Inject('CONNECTION')
    private connection: Connection,
  ) {
    this.manager = connection.manager
  }

  get tenant () {
    return `ten_${this.connection.name}`
  }

  public async allUsers (teamCode: number): Promise<AllUsersQueryResult[]> {
    const teamEntity = await this.manager.findOneOrFail(CadEquipeEntity, { where: { cd: teamCode } })
    const [query, parameters] = this.connection.driver.escapeQueryWithParameters(
      `
      SELECT
        cv.cd AS code,
        cv."nmVendedor" AS name,
        cv."idEmail" AS email,
        cv."fgAtivo" AS active,
        cv."idLogin" AS login_id,
        cv."fgFuncao" AS role,
        (case when "idSenha" is null then false else true end) AS password_created,
        ce."idEquipe" AS team_id,
        ce.cd as team_code,
        ce."nmEquipe" AS team_name
          FROM ${this.tenant}.cad_vendedor cv
            JOIN ${this.tenant}.cad_equipe ce ON ce.cd = cv."cdEquipe"
        WHERE ce."idEquipe" SIMILAR TO :teamId || '%'
        ORDER BY team_id, name
      `,
      { teamId: teamEntity.idEquipe },
      {}
    )
    return await this.manager.query(query, parameters)
  }
}
