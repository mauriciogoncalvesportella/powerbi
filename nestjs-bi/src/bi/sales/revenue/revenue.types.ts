export interface RAWRevenue {
  date: string,
  value: number
}

export interface RAWRevenueSellerTeam {
  sellerCode: number,
  teamCode: number,
  teamId: string,
  sellerName: string,
  teamName: string,
  value: number,
  parentTeam: number,
  parentTeamsCd: number[],
}

export interface RAWRevenueMonthlySeller {
  sellerCode: number,
  sellerName: string,
  value: number,
}

export interface RAWRevenueAccumulated {
  team: string,
  goal?: number,
  value: number,
}

export interface RAWRevenueAccumulatedBySeller {
  seller: string,
  goal: number,
  value: number,
}

/* DTO's */
export interface RevenueFromTeamDTO {
  teamCode: number,
  value: number,
  sellersValue: number,
  childTeams: {
    teamCode: number,
    value: number
  }[],
  sellers: {
    sellerCode: number,
    value: number
  }[]
}

export interface RevenueDTO {
  goal: number,
  dates: string[],
  values: number[],
  goalValues: number[],
  meta?: any,
}

export interface RevenueMonthlyTeamsDTO {
  teams: string[],
  values: number[],
  goalValues: number[]
}

export interface RevenueMonthlyDTO {
  cds: number[],
  labels: string[],
  values: number[],
  goalValues: number[],
  types: number[] // 0- Team, 1- seller
}

export interface ComparativeTeamDaily {
  yearMonthArr: string[],
  days: number[],
  valueSeries: number[][], 
}

/*
export interface RevenueMonthlySellersDTO {
  sellers: string[],
  values: number[],
  goalValues: number[]
}
*/
