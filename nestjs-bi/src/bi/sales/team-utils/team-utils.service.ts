import { Inject, Injectable } from "@nestjs/common";
import { ConnectOpts } from "net";
import { CadEquipeEntity } from "src/database/entity/tenant/cad_equipe.entity";
import { CadVendedorEntity } from "src/database/entity/tenant/cad_vendedor.entity";
import { Connection, ConnectionManager, EntityManager, In, Like } from "typeorm";
import { ChildTeamsQueryResult, SellersQueryResult as SellerQueryResult, TeamUtilsRepository } from "./team-utils.interfaces";

@Injectable()
export class TeamUtilsService {
  private manager: EntityManager

  constructor (
    @Inject('CONNECTION')
    private connection: Connection,
    private repository: TeamUtilsRepository
  ) {
    this.manager = this.connection.manager
  }

  public async getSellerCodeOrTeamId (code: number, type: 'team' | 'seller', ): Promise<{ teamId: string, sellerCode: number }> {
    const sellerCode = type === 'seller' ? code : -1
    let teamId = 'impossible'
    if (type === 'team') {
      ({ idEquipe: teamId } = await this.connection.manager.findOneOrFail(CadEquipeEntity, code))
    }
    
    return {
      sellerCode,
      teamId
    }
  }

  public async expandTeam (code: number) {
    const expandTeamReturn = {
      teamEntities: {} as Record<number, ChildTeamsQueryResult>,
      sellersEntities: {} as Record<number, SellerQueryResult>,
      rootTeam: code,
      teams: {} as Record<number, { parent_team: number, type: 'parent' | 'child' }>
    }

    const teams = await this.repository.getChildTeams(code)
    const sellers = await this.repository.getSellersFromTeam(code)

    for (const team of teams) {
      expandTeamReturn.teamEntities[team.code] = team
      if (team.code !== team.parent_team_code) {
        expandTeamReturn.teams[team.code] = {
          parent_team: team.parent_team_code,
          type: team.parent_team_code === code ? 'parent' : 'child'
        }
      }
    }

    for (const seller of sellers) {
      expandTeamReturn.sellersEntities[seller.code] = seller
    }

    return expandTeamReturn;
  }

  public async getTeam (code: number): Promise<CadEquipeEntity> {
    return await this.manager.findOneOrFail(CadEquipeEntity, code)
  }
}