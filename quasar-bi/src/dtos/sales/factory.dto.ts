import { IBaseChart } from './revenue.dto'

export interface FactoryResumeDTO extends IBaseChart {
  codes: number[],
  total_orders: number[],
  ids: string[],
  quantities: number[]
}

export interface ResumeTeamByFactoryDTO extends IBaseChart {
  codes: number[],
  types: ('seller'|'team')[],
  total_orders: number[]
}
