// Controller dependencies
export interface DropdownNodeDTO {
  key: string,
  code: number,
  label: string,
  type: string,
  children?: DropdownNodeDTO[]
}

export const createTeamDropDownDTO = (code: number, label: string, type: string): DropdownNodeDTO => {
  return {
    key: `${type}_${code}`,
    code,
    label,
    type,
    children: []
  } 
}

export const createTeamNode = (team: QueryResultTeam) => {
  return {
    key: `team_${team.team_code}`,
    code: team.team_code,
    label: team.team_name,
    type: 'team',
    children: []
  }
}

export const createSellerNode = (seller: QueryResultSeller) => {
  return {
    key: `seller_${seller.seller_code}`,
    code: seller.seller_code,
    label: seller.seller_name,
    type: 'seller',
    children: undefined
  }
}

export interface IDropdownGenerator {
  generateDropdown (code: number, interval: string[]): Promise<DropdownNodeDTO>
}

// Generator dependencies
export interface QueryResultSeller {
  seller_code: number,
  seller_name: string,
  team_code: number,
  team_id: string
}

export interface QueryResultTeam {
  team_code: number,
  parent_team_code: number,
  team_id: string,
  team_name: string
}

export interface IDropdownQueries {
  getSellers (code: number, interval: string[]): Promise<QueryResultSeller[]>
  getTeams (code: number): Promise<QueryResultTeam[]>
}
