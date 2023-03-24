export interface IBaseChart {
  values: number[],
  labels: string[]
}

export interface IBaseDailyChart extends IBaseChart {
  dates: string[] | number[],
  goal_values: number[]
}

export interface IBaseResumeChart extends IBaseChart {
  codes: number[],
  goal_values: number[],
  type: ('team' | 'seller')[]
}

export interface RevenueDailyDTO extends IBaseDailyChart {
  prospect: number[],
  billed: number[],
  not_billed: number[]
}

export interface RevenueResumeDTO extends IBaseResumeChart {
  not_billed: number[],
  billed: number[]
}

export interface LinearityPotentialDTO extends IBaseChart {
  values: number[],
  labels: string[],
  count: number[],
  goal_values: number[]
}

export interface LinearityResumeDTO extends IBaseChart {
  count: number[]
}

export interface ProfitDailyBars extends IBaseDailyChart {
  billed: number[]
  not_billed: number[]
}
export interface ProfitResumeBars extends IBaseResumeChart {
  billed: number[]
  not_billed: number[]
}

export interface ComparativeDTO {
  categories: string[],
  series: {
    code: number,
    label: string,
    type: string,
    values: number[]
  }[]
}
