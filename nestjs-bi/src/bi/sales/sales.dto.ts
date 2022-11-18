export interface IBaseChart {
  values: number[]
}

export interface IBaseChartGoal extends IBaseChart {
  goal_values: number[]
}

export interface IBaseDailyChart extends IBaseChartGoal {
  dates: string[] | number[]
}

export interface IBaseResumeChart extends IBaseChartGoal {
  codes: number[],
  labels: string[],
  type: string[]
}
