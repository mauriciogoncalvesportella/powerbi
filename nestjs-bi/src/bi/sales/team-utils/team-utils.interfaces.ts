export interface ChildTeamsQueryResult {
  code: number
  label: string
  team_id: string
  seller_leader_code: number
  parent_team_code: number
}

export interface SellersQueryResult {
  code: number,
  id: string,
  team_code: number,
  label: string,
  email: string,
  id_login: string,
  enabled: boolean,
  role: number
}

export abstract class TeamUtilsRepository {
  abstract getChildTeams (rootTeam: number): Promise<ChildTeamsQueryResult[]>
  abstract getSellers (): Promise<SellersQueryResult[]>
  abstract getSellersFromTeam (teamCode: number): Promise<SellersQueryResult[]>
}
