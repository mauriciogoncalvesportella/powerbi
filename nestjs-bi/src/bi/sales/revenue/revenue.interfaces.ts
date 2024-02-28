import { IBaseDailyChart, IBaseResumeChart } from "../sales.dto";
import {DateOrYearMonthParam} from "../sales.types";
import {RevenueGoal} from "./revenue-goal/revenue-goal.types";

// Generator dependencies
export interface QueryResultDailyRevenue {
  date: string,
  cost_value: number,
  profit_value: number,
  billed: number,
  not_billed: number
}

export interface QueryResultResumeRevenue {
  type: 'seller' | 'team',
  code: number,
  label: string,
  billed: number,
  not_billed: number,
  cost_value: number,
  profit_value: number
}

export interface IRevenueQueries {
  daily (cd: number, type: 'team' | 'seller', yearMonth: string): Promise<QueryResultDailyRevenue[]>
  dailyCumulative (cd: number, type: 'team' | 'seller', yearMonth: string): Promise<QueryResultDailyRevenue[]>
  resume (teamCode: number, dateOrYearMonth: DateOrYearMonthParam): Promise<QueryResultResumeRevenue[]>
}

// Controller dependencies
export interface DailyRevenueDTO extends IBaseDailyChart {
  prospect: number[]
  billed: number[]
  not_billed: number[]
}

export interface ResumeRevenueDTO extends IBaseResumeChart {
  billed: number[]
  not_billed: number[]
}

export interface IRevenueGenerator {
  daily (cd: number, type: 'team' | 'seller', yearMonth: string, cumulative: boolean, strategy: IRevenueStrategy): Promise<DailyRevenueDTO>
  resume (teamCode: number, dateOrYearMonth: DateOrYearMonthParam, strategy: IRevenueStrategy): Promise<ResumeRevenueDTO>
}

export interface IRevenueStrategyObject {
  billed: number,
  not_billed: number,
  cost_value: number,
  profit_value: number
}

export interface IRevenueStrategy {
  execute (row: IRevenueStrategyObject): number
  executeDailyGoal (goal: RevenueGoal, dates: string[], cumulative?: boolean): number[]
  executeResumeGoal (goal: Map<string, RevenueGoal>, codes: number[], types: string[]): number[]
}
