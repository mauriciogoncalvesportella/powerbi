import {CadEquipeEntity} from "src/database/entity/tenant/cad_equipe.entity";
import {CadEquipeMetaMensalEntity} from "src/database/entity/tenant/cad_equipe_meta_mensal.entity";

export interface SellersWithTeam {
  sellerCode: number,
  teamCode: number,
  seller: string,
  team: string,
}

export interface SellerWithGoal {
  sellerCode: number,
  sellerName: string,
  teamCode: number,
  teamId: number,
  goal: number,
}

export interface TeamsSellersFromTeamDTO {
  parentTeam: {
    teamCode: number,
    teamId: string,
    teamName: string
  }
  childSellers: {
    sellerCode: number,
    sellerName: string,
  }[],
  childTeams: {
    teamCode: number,
    teamId: string,
    teamName: string
  }[]
}

export type MapSellerWithGoal = Map<number, SellerWithGoal>

export type MapSellerWithGoalAndTotalGoal = {
  mapSellerWithGoal: MapSellerWithGoal,
  totalGoal: number
}

export interface TeamsWithGoal {
  teams: CadEquipeEntity[],
  goals: CadEquipeMetaMensalEntity[]
}

export interface TeamWithGoal {
  team: CadEquipeEntity,
  goal: CadEquipeMetaMensalEntity,
}

export type MapTeamWithGoal = Map<number, TeamWithGoal>
