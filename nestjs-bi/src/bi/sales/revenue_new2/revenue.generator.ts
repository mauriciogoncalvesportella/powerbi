import {Inject, Injectable} from "@nestjs/common";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {TeamService} from "../team/team.service";
import {DateValueUtils} from "../utils/date-value.utils";
import {IRevenueDailyDTO, IRevenueGenerator, IRevenueResumeDTO} from "./revenue.controller";
import {RevenueQueries} from "./revenue.queries";
import {RevenueGoals} from "./revenue.goals";
const _ = require('lodash')

export interface QueryResultDailyRevenue {
  date: string,
  billed: number,
  not_billed: number,
  goal: number
}

export interface QueryResultResumeRevenue {
  type: 'seller' | 'team',
  code: number,
  label: string,
  billed: number,
  not_billed: number,
  goal: number
}

export interface IRevenueQueries {
  daily (sellers: number[], yearMonth: string, dailyGoal: number): Promise<QueryResultDailyRevenue[]>;
  dailyCumulative (sellers: number[], yearMonth: string, dailyGoal: number, monthlyGoal: number): Promise<QueryResultDailyRevenue[]>;
  resumeByTeams (cds: number[], dates: Date[]): Promise<QueryResultResumeRevenue[]>;
  resumeBySellers (cds: number[], dates: Date[]): Promise<QueryResultResumeRevenue[]>;
}

export interface DailyGoal {
  daily: number,
  monthly: number
}

export interface ResumeGoal {
  code: number,
  goal: number
}

export interface IRevenueGoals {
  dailyBySellers (sellers: number[], yearMonth: string): Promise<DailyGoal>;
  dailyByTeams (teams: number[], yearMonth: string): Promise<DailyGoal>;
  resumeByTeams (teams: number[], dates: Date[]): Promise<Record<number, number>>;
  resumeBySellers (sellers: number[], dates: Date[]): Promise<Record<number, number>>;
}

@Injectable()
export class RevenueGenerator implements IRevenueGenerator {
  constructor (
    @Inject(RevenueQueries)
    private queries: IRevenueQueries,
    @Inject(RevenueGoals)
    private goals: IRevenueGoals,
    private teamService: TeamService,
    private requestMetadata: RequestMetadata,
  ) {}

  async dailyBySellersChart (cds: number[], yearMonth: string, cumulative: boolean): Promise<IRevenueDailyDTO> {
    const { daily, monthly } = await this.goals.dailyBySellers(cds, yearMonth)
    let queryResult: QueryResultDailyRevenue[] = !cds.length ? [] : cumulative
      ? await this.queries.dailyCumulative(cds, yearMonth, daily, monthly)
      : await this.queries.daily(cds, yearMonth, daily)

    return {
      dates: _.map(queryResult, 'date'),
      values: _.map(queryResult, 'billed'),
      not_billed_values: _.map(queryResult, 'not_billed'),
      goal_values: _.map(queryResult, 'goal')
    }
  }

  async dailyByTeamsChart (cds: number[], yearMonth: string, cumulative: boolean): Promise<IRevenueDailyDTO> {
    const { daily, monthly } = await this.goals.dailyByTeams(cds, yearMonth)
    cds = (await this.teamService.sellersFromTeams(...cds)).cds
    let queryResult: QueryResultDailyRevenue[] = !cds.length ? [] : cumulative
      ? await this.queries.dailyCumulative(cds, yearMonth, daily, monthly)
      : await this.queries.daily(cds, yearMonth, daily)

    return {
      dates: _.map(queryResult, 'date'),
      values: _.map(queryResult, 'billed'),
      not_billed_values: _.map(queryResult, 'not_billed'),
      goal_values: _.map(queryResult, 'goal')
    }
  }

  async resumeByTeamsChart (cds: number[], yearMonth: string, dates?: Date[]): Promise<IRevenueResumeDTO> {
    const closingDate = await this.requestMetadata.dtFechamento()
    dates = dates ?? DateValueUtils.yearMonthBound(yearMonth, closingDate)
    const resumeByTeams = await this.goals.resumeByTeams(cds, dates)
    let queryResult: QueryResultResumeRevenue[] = !cds.length ? [] : (await this.queries.resumeByTeams(cds, dates)).map(value => ({
      ...value,
      goal: resumeByTeams[value.code]
    }))

    return {
      codes: _.map(queryResult, 'code'),
      labels: _.map(queryResult, 'label'),
      values: _.map(queryResult, 'billed'),
      not_billed_values: _.map(queryResult, 'not_billed'),
      type: _.map(queryResult, 'type'),
      goal_values: _.map(queryResult, 'goal')
    }
  }

  async resumeBySellersChart (cds: number[], yearMonth: string, dates?: Date[]): Promise<IRevenueResumeDTO> {
    const closingDate = await this.requestMetadata.dtFechamento()
    dates = dates ?? DateValueUtils.yearMonthBound(yearMonth, closingDate)
    const resumeBySellers = await this.goals.resumeBySellers(cds, dates)
    let queryResult: QueryResultResumeRevenue[] = !cds.length ? [] : (await this.queries.resumeBySellers(cds, dates)).map(value => ({
      ...value,
      goal: resumeBySellers[value.code]
    }))

    return {
      codes: _.map(queryResult, 'code'),
      labels: _.map(queryResult, 'label'),
      values: _.map(queryResult, 'billed'),
      not_billed_values: _.map(queryResult, 'not_billed'),
      type: _.map(queryResult, 'type'),
      goal_values: _.map(queryResult, 'goal')
    }
  }

  async resumeByTeamChart (cd: number, yearMonth: string, dates?: Date[]): Promise<IRevenueResumeDTO> {
    const closingDate = await this.requestMetadata.dtFechamento()
    dates = dates ?? DateValueUtils.yearMonthBound(yearMonth, closingDate)
    const sellers = (await this.teamService.sellersFromLeafTeams([cd])).map(seller => seller.cd)
    const teams = (await this.teamService.teamsFromNonLeafTeams([cd])).map(team => team.cd)
    const resumeByTeams = await this.resumeByTeamsChart(teams, yearMonth, dates)
    const resumeBySellers = await this.resumeBySellersChart(sellers, yearMonth, dates)

    return {
      codes: [...resumeByTeams.codes, ...resumeBySellers.codes],
      labels: [...resumeByTeams.labels, ...resumeBySellers.labels],
      values: [...resumeByTeams.values, ...resumeBySellers.values],
      not_billed_values: [...resumeByTeams.not_billed_values, ...resumeBySellers.not_billed_values],
      type: [...resumeByTeams.type, ...resumeBySellers.type],
      goal_values: [...resumeByTeams.goal_values, ...resumeBySellers.goal_values]
    }
  }
}
