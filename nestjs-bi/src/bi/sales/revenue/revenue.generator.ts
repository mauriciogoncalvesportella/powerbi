import {Inject, Injectable} from "@nestjs/common";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {DateOrYearMonthParam} from "../sales.types";
import {RevenueGoalGenerator} from "./revenue-goal/revenue-goal.generator";
import {RevenueGoal} from "./revenue-goal/revenue-goal.types";
import {DailyRevenueDTO, IRevenueGenerator, IRevenueQueries, IRevenueStrategy, IRevenueStrategyObject, QueryResultDailyRevenue, ResumeRevenueDTO} from "./revenue.interfaces";
import {RevenueQueries} from "./revenue.queries";
import { addDays, differenceInBusinessDays, getDay, isWeekend } from 'date-fns'
import {ArrayUtils} from "src/utils/array.utils";
const _ = require('lodash')

@Injectable()
export class RevenueGenerator implements IRevenueGenerator {
  constructor (
    @Inject(RevenueQueries)
    private queries: IRevenueQueries,
    private metadata: RequestMetadata,
    private goal: RevenueGoalGenerator,
    private requestMetadata: RequestMetadata
  ) {}

  async daily (cd: number, type: 'team' | 'seller', yearMonth: string, cumulative: boolean, strategy: IRevenueStrategy): Promise<DailyRevenueDTO> {
    /*
      Quando cumulativo é necessário o valor de `queryResultRegular`. Então,
      em todos os casos os valores cumulativo e normal são buscados do banco
      de dados
    */
    const queryResultRegular = await this.queries.daily(cd, type, yearMonth) 
    const queryResultCumulative = await this.queries.dailyCumulative(cd, type, yearMonth)
    const queryResult = cumulative ? queryResultCumulative : queryResultRegular

    const dates = _.map(queryResult, 'date')
    const monthlyGoal = type === 'team'
      ? await this.goal.teamGoal(cd, yearMonth)
      : await this.goal.sellerGoal(cd, yearMonth)
    const goal_values: number[] = strategy.executeDailyGoal(monthlyGoal, dates, cumulative)
    const prospect = queryResult.map(item => item.billed + item.not_billed)

    /*
      Inicio do cálculo do prospect (expectativa), apenas para gráfico
      cumulativo e quando está no mês atual 
    */
    const currentYearMonth = await this.requestMetadata.getYearMonth(new Date())
    if (cumulative && currentYearMonth === yearMonth) {
      let prospectBeginIndex = -1
      let totalRevenue = 0
      let prospectCurrentSum = 0

      /*
        Busca o indice do último dia do mês faturado (prospectBeginIndex) e
        reaproveita a iteração para calcular o primeiro valor do prospect
        (prospectCurrentSum) e o valor total de faturamento (totalRevenue)
      */
      for (let i = queryResultRegular.length - 1; i >= 0; i--) {
        const currentBilled = queryResultRegular[i].billed
        const currentNotBilled = queryResultRegular[i].not_billed
        const revenue = currentBilled + currentNotBilled

        if (revenue > 0) {
          if (prospectBeginIndex == -1) {
            prospectBeginIndex = i 
            prospectCurrentSum = (queryResultCumulative[i].billed + queryResultCumulative[i].not_billed)
          }
          totalRevenue += revenue
        }
      }

      /*
        Em `totalOccurrencesRevenue` é calculado o total de dias comerciais,
        esse número é necessário para calcular a média do faturamento
      */
      const interval = [new Date(dates[0]), addDays(new Date(dates[prospectBeginIndex]), 1)]
      const totalOccurrencesRevenue = differenceInBusinessDays(interval[1], interval[0])


      if (prospectBeginIndex !== -1) {
        const revenueMean = totalRevenue / totalOccurrencesRevenue
        for (let i = prospectBeginIndex; i < queryResultRegular.length; i++) {
          const dayOfWeek = getDay(new Date(dates[i]))
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            prospectCurrentSum += revenueMean
          }
          prospect[i] = prospectCurrentSum
        }
      }
    }

    return {
      prospect,
      dates: _.map(queryResult, 'date'),
      billed: _.map(queryResult, 'billed'),
      not_billed: _.map(queryResult, 'not_billed'),
      goal_values: goal_values,
      values: queryResult.map(row => strategy.execute(row))
    }
  }

  async resume (teamCode: number, dateOrYearMonth: DateOrYearMonthParam, strategy: IRevenueStrategy): Promise<ResumeRevenueDTO> {
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

  static RevenueStrategy = class implements IRevenueStrategy {
    execute (row: IRevenueStrategyObject) {
      return row.billed + row.not_billed 
    }
    executeDailyGoal (goal: RevenueGoal, dates: string[], cumulative: boolean): number[] {
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
    executeResumeGoal (goal: Map<string, RevenueGoal>, codes: number[], types: string[]): number[] {
      return codes.map((_, index) => goal.get(`${codes[index]}_${types[index]}`).revenue ?? 0)
    }
  }

  static MarkupStrategy = class implements IRevenueStrategy {
    execute (row: IRevenueStrategyObject) {
      return row.cost_value === 0
        ? 0
        : (((row.not_billed + row.billed)/row.cost_value) - 1) * 100
    }
    executeDailyGoal (goal: RevenueGoal, dates: string[]): number[] {
      return dates.map(() => goal.markup)
    }
    executeResumeGoal (goal: Map<string, RevenueGoal>, codes: number[], types: string[]): number[] {
      return codes.map((_, index) => goal.get(`${codes[index]}_${types[index]}`).markup ?? 0)
    }
  }

  static ProfitStrategy = class implements IRevenueStrategy {
    execute (row: IRevenueStrategyObject) {
      return row.cost_value === 0
        ? 0
        : (row.profit_value/(row.billed + row.not_billed)) * 100
    }
    executeDailyGoal (goal: RevenueGoal, dates: string[]): number[] {
      return dates.map(() => goal.profit)
    }
    executeResumeGoal (goal: Map<string, RevenueGoal>, codes: number[], types: string[]): number[] {
      return codes.map((value, index) => goal.get(`${codes[index]}_${types[index]}`).profit ?? 0)
    }
  }
}
