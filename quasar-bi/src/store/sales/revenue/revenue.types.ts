export interface RevenueBaseDTO {
  values: number[],
  goalValues: number[],
  meta: any
}

export interface RevenueDTO extends RevenueBaseDTO {
  goal: number,
  dates: number[],
}

export interface RevenueMonthlySellers extends RevenueBaseDTO {
  sellers: string[]
}

export interface RevenueMonthlyTeams extends RevenueBaseDTO {
  teams: string[]
}

export interface RevenueTeam {
  teamCode: number,
  value: number,
  sellersValue: number,
  childTeams: {
    teamCode: number,
    value: number,
  }[],
  sellers: {
    sellerCode: number,
    value: number,
  }[]
}

export interface RevenueSeller {
  sellerCode: number,
  sellerName: string,
  value: number
}

export interface ComparativeTeamDaily {
  yearMonthArr: string[],
  days: number[],
  valueSeries: number[][],
}
