import { IBaseDailyChart, IBaseResumeChart } from "../sales.dto";
import {DateOrYearMonthParam} from "../sales.types";
import {ProfitGoal} from "./profit-goal/profit-goal.types";

// Generator dependencies
export interface QueryResultDailyProfit {
  date: string,
  cost_value: number,
  profit_value: number,
  billed: number,
  not_billed: number
}

export interface QueryResultResumeProfit {
  type: 'seller' | 'team',
  code: number,
  label: string,
  billed: number,
  not_billed: number,
  cost_value: number,
  profit_value: number
}

export interface IProfitQueries {
  daily (cd: number, type: 'team' | 'seller', yearMonth: string): Promise<QueryResultDailyProfit[]>
  dailyCumulative (cd: number, type: 'team' | 'seller', yearMonth: string): Promise<QueryResultDailyProfit[]>
  resume (teamCode: number, dateOrYearMonth: DateOrYearMonthParam): Promise<QueryResultResumeProfit[]>
}

// Controller dependencies
export interface DailyProfitDTO extends IBaseDailyChart {
  prospect: number[]
  billed: number[]
  not_billed: number[]
}

export interface ResumeProfitDTO extends IBaseResumeChart {
  billed: number[]
  not_billed: number[]
}

export interface IProfitGenerator {
  daily (cd: number, type: 'team' | 'seller', yearMonth: string, cumulative: boolean, strategy: IProfitStrategy): Promise<DailyProfitDTO>
  resume (teamCode: number, dateOrYearMonth: DateOrYearMonthParam, strategy: IProfitStrategy): Promise<ResumeProfitDTO>
}

export interface IProfitStrategyObject {
  billed: number,
  not_billed: number,
  cost_value: number,
  profit_value: number
}

export interface IProfitStrategy {
  execute (row: IProfitStrategyObject): number
  executeDailyGoal (goal: ProfitGoal, dates: string[], cumulative?: boolean): number[]
  executeResumeGoal (goal: Map<string, ProfitGoal>, codes: number[], types: string[]): number[]
}
