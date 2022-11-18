import {Inject, Injectable} from "@nestjs/common";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {DateOrYearMonthParam} from "../sales.types";
import {ProfitGoalGenerator} from "./profit-goal/profit-goal.generator";
import {ProfitGoal} from "./profit-goal/profit-goal.types";
import {DailyProfitDTO, IProfitGenerator, IProfitQueries, IProfitStrategy, IProfitStrategyObject, QueryResultDailyProfit, ResumeProfitDTO} from "./profit.interfaces";
import {ProfitQueries} from "./profit.queries";
import { addDays, differenceInBusinessDays, getDay, isWeekend } from 'date-fns'
import {ArrayUtils} from "src/utils/array.utils";
const _ = require('lodash')

@Injectable()
export class ProfitGenerator implements IProfitGenerator {
  constructor (
    @Inject(ProfitQueries)
    private queries: IProfitQueries,
    private metadata: RequestMetadata,
    private goal: ProfitGoalGenerator
  ) {}

  async daily (cd: number, type: 'team' | 'seller', yearMonth: string, cumulative: boolean, strategy: IProfitStrategy): Promise<DailyProfitDTO> {
    const queryResult = cumulative
      ? await this.queries.dailyCumulative(cd, type, yearMonth)
      : await this.queries.daily(cd, type, yearMonth)
    const dates = _.map(queryResult, 'date')
    const monthlyGoal = type === 'team'
      ? await this.goal.teamGoal(cd, yearMonth)
      : await this.goal.sellerGoal(cd, yearMonth)
    const goal_values: number[] = strategy.executeDailyGoal(monthlyGoal, dates, cumulative)

    return {
      dates: _.map(queryResult, 'date'),
      billed: _.map(queryResult, 'billed'),
      not_billed: _.map(queryResult, 'not_billed'),
      goal_values: goal_values,
      values: queryResult.map(row => strategy.execute(row))
    }
  }

  async resume (teamCode: number, dateOrYearMonth: DateOrYearMonthParam, strategy: IProfitStrategy): Promise<ResumeProfitDTO> {
    const yearMonthGoal = dateOrYearMonth.type === 'yearMonth'
      ? dateOrYearMonth.yearMonthParam 
      : await this.metadata.getYearMonth(dateOrYearMonth.dateParam[0])

    const queryResult = await this.queries.resume(teamCode, dateOrYearMonth)
    const mapGoal = await this.goal.resumeGoal(teamCode, yearMonthGoal)
    const codes = _.map(queryResult, 'code')
    const types = _.map(queryResult, 'type')
    const goal_values = strategy.executeResumeGoal(mapGoal, codes, types)

    if (dateOrYearMonth.type === 'yearMonth') {
    } else if (dateOrYearMonth.type === 'dates') {
    }

    return {
      codes,
      type: types,
      labels: _.map(queryResult, 'label'),
      billed: _.map(queryResult, 'billed'),
      not_billed: _.map(queryResult, 'not_billed'),
      goal_values,
      values: queryResult.map(row => strategy.execute(row))
    }
  }

  static RevenueStrategy = class implements IProfitStrategy {
    execute (row: IProfitStrategyObject) {
      return row.billed + row.not_billed 
    }
    executeDailyGoal (goal: ProfitGoal, dates: string[], cumulative: boolean): number[] {
      const date0 = new Date(dates[0])
      const date1 = new Date(dates[dates.length - 1])
      const differenceCount = differenceInBusinessDays(addDays(date1, 1), date0)
      const dailyGoal = goal.revenue/differenceCount
      let goals: number[] = []
      if (cumulative) {
        goals = dates.map(date => !isWeekend(new Date(date)) ? dailyGoal : 0)
        ArrayUtils.array2cumulative(goals)
        goals[goals.length - 1] = goal.revenue
      } else {
        goals = dates.map(() => dailyGoal)
      }
      return goals
    }
    executeResumeGoal (goal: Map<string, ProfitGoal>, codes: number[], types: string[]): number[] {
      return codes.map((_, index) => goal.get(`${codes[index]}_${types[index]}`).revenue ?? 0)
    }
  }

  static MarkupStrategy = class implements IProfitStrategy {
    execute (row: IProfitStrategyObject) {
      return row.cost_value === 0
        ? 0
        : (((row.not_billed + row.billed)/row.cost_value) - 1) * 100
    }
    executeDailyGoal (goal: ProfitGoal, dates: string[]): number[] {
      return dates.map(() => goal.markup)
    }
    executeResumeGoal (goal: Map<string, ProfitGoal>, codes: number[], types: string[]): number[] {
      return codes.map((_, index) => goal.get(`${codes[index]}_${types[index]}`).markup ?? 0)
    }
  }

  static ProfitStrategy = class implements IProfitStrategy {
    execute (row: IProfitStrategyObject) {
      return row.cost_value === 0
        ? 0
        : (row.profit_value/(row.billed + row.not_billed)) * 100
    }
    executeDailyGoal (goal: ProfitGoal, dates: string[]): number[] {
      return dates.map(() => goal.profit)
    }
    executeResumeGoal (goal: Map<string, ProfitGoal>, codes: number[], types: string[]): number[] {
      return codes.map((value, index) => goal.get(`${codes[index]}_${types[index]}`).profit ?? 0)
    }
  }
}
