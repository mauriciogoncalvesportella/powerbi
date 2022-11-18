import {BadRequestException, Inject, Injectable, NotImplementedException} from "@nestjs/common";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {GoalRepository, GoalSellers, GoalTeams} from "../goal.repository";
import {IOrderResumeSeller, IOrderResumeTeam} from "../order.repository";
import {IBaseDateValue} from "../sales.types";
import {SellerService} from "../team/seller.service";
import {TeamService} from "../team/team.service";
import {MapTeamWithGoal} from "../team/team.types";
import {DateValueUtils} from "../utils/date-value.utils";
import {GoalUtils} from "../utils/goal.utils";
import {RevenueRepository} from './revenue.repository'
import {IRevenueDailyBarsDTO, IRevenueGenerator, IRevenueResumeDTO} from "./revenue.controller";
import {RevenueQueries} from "./revenue.queries";
import {RevenueGoals} from "./revenue.goal";
import {DateUtils} from "src/utils/date.utils";
const _ = require('lodash')

export interface IRevenueDateValue extends IBaseDateValue {}
export interface IRevenueResumeSeller extends IOrderResumeSeller {}
export interface IRevenueResumeTeam extends IOrderResumeTeam {}

export interface IRevenueRepository {
  revenueGroupByDate (
    sellers: number[],
    yearMonth: string[],
    fgSituacao: number,
    dateQuery?: 'dtEntrega' | 'dtEmissao'
  ): Promise<IRevenueDateValue[]>;

  revenueResumeTeams (
    teams: number[],
    sellers: number[],
    yearMonth: string[],
    fgSituacao: number,
    dates: string[]
  ): Promise<IRevenueResumeTeam[]>;

  revenueResumeSellers (
    sellers: number[],
    yearMonth: string[],
    fgSituacao: number,
    dates: string[]
  ): Promise<IRevenueResumeSeller[]>;
}

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
}

@Injectable()
// @ts-ignore
export class RevenueGenerator implements IRevenueGenerator {
  constructor (
    @Inject(RevenueRepository)
    private repository: IRevenueRepository,
    @Inject(RevenueQueries)
    private queries: IRevenueQueries,
    @Inject(RevenueGoals)
    private goals: IRevenueGoals,
    private teamService: TeamService,
    private sellerService: SellerService,
    private requestMetadata: RequestMetadata,
    private goalRepository: GoalRepository
  ) {}

  private async dailyGenerator (cds: number[], yearMonth: string, fgSituacao: number, type: 'team' | 'seller') {
    const closingDate = await this.requestMetadata.dtFechamento()
    let monthlyGoal: number = 0
    let dateValue: IRevenueDateValue[]
    let notBilledDateValue: IRevenueDateValue[] 
    let cdArr: number[] = []
    let mapTeamWithGoal: MapTeamWithGoal = null

    switch (type) {
      case 'seller':
        monthlyGoal = (await this.sellerService.sellersWithGoal(yearMonth, cds)).totalGoal
        // const sellersWithTeam = await this.sellerService.sellersWithTeam(cds)
        // const teams = sellersWithTeam.map(it => it.teamCode)
        // mapTeamWithGoal = (await this.teamService.teamsWithGoal(yearMonth, ...teams)).mapTeamWithGoal
        cdArr = cds
        break;

      case 'team':
        cdArr = (await this.teamService.sellersFromTeams(...cds)).cds
        mapTeamWithGoal = (await this.teamService.teamsWithGoal(yearMonth, ...cds)).mapTeamWithGoal
        mapTeamWithGoal.forEach((value) => {
          // @ts-ignore
          monthlyGoal += parseFloat(value?.goal?.vlMetaVenda ?? '0')
        })
        break;

      default:
        throw new NotImplementedException('type !== \'teams\' | \'sellers\' not implemented')
    }

    dateValue = await this.repository.revenueGroupByDate(cdArr, [yearMonth], fgSituacao)
    notBilledDateValue = await this.repository.revenueGroupByDate(cdArr, [yearMonth], 1, 'dtEmissao')
    dateValue = DateValueUtils.arrangeDatesRAWRevenue(dateValue, yearMonth, closingDate)
    notBilledDateValue = DateValueUtils.arrangeDatesRAWRevenue(notBilledDateValue, yearMonth, closingDate)
    const dailyGoal = GoalUtils.calculateDailyGoal(dateValue, monthlyGoal)

    return {
      dailyGoal,
      monthlyGoal,
      dateValue,
      notBilledDateValue
    }
  }
  
  async dailyBySellersChart (cds: number[], yearMonth: string, cumulative: boolean) {
    const { daily, monthly } = await this.goals.dailyBySellers(cds, yearMonth)
    let queryResult: QueryResultDailyRevenue[] = cumulative
      ? await this.queries.dailyCumulative(cds, yearMonth, daily, monthly)
      : await this.queries.daily(cds, yearMonth, daily)
    return {
      date: _.map(queryResult, 'date'),
      billed: _.map(queryResult, 'billed'),
      not_billed: _.map(queryResult, 'not_billed'),
      goal: _.map(queryResult, 'goal')
    }
  }

  async dailyByTeamsChart (cds: number[], yearMonth: string, cumulative: boolean) {
    const { daily, monthly } = await this.goals.dailyByTeams(cds, yearMonth)
    cds = (await this.teamService.sellersFromTeams(...cds)).cds
    let queryResult: QueryResultDailyRevenue[] = cumulative
      ? await this.queries.dailyCumulative(cds, yearMonth, daily, monthly)
      : await this.queries.daily(cds, yearMonth, daily)
    return {
      dates: _.map(queryResult, 'date'),
      billed: _.map(queryResult, 'billed'),
      not_billed: _.map(queryResult, 'not_billed'),
      goals: _.map(queryResult, 'goal')
    }
  }

  async resumeByTeamsChart (cds: number[], yearMonth: string, dates?: Date[]) {
    const closingDate = await this.requestMetadata.dtFechamento()
    dates = dates ?? DateValueUtils.yearMonthBound(yearMonth, closingDate)
    let queryResult: QueryResultResumeRevenue[] = await this.queries.resumeByTeams(cds, dates)
    return queryResult
  }

  async dailySellerChart (cds: number[], yearMonth: string, fgSituacao: number, accumulated: boolean): Promise<IRevenueDailyBarsDTO> {
    let { dateValue, notBilledDateValue, monthlyGoal, dailyGoal } = await this.dailyGenerator(cds, yearMonth, fgSituacao, 'seller')
    let goalValues: number[]
    
    if (accumulated) {
      dateValue = GoalUtils.calculateAccumulate(dateValue)
      notBilledDateValue = GoalUtils.calculateAccumulate(notBilledDateValue)
      goalValues = GoalUtils.calculateGoalAccumulate(dateValue, dailyGoal, monthlyGoal)
    } else {
      goalValues = GoalUtils.calculateGoal(dateValue, dailyGoal)
    }

    return {
      notBilledValues: notBilledDateValue.map(item => item.value),
      goal: monthlyGoal,
      goalValues,
      values: dateValue.map(item => item.value),
      dates: dateValue.map(item => item.date)
    }
  }

  async dailyTeamsChart (cds: number[], yearMonth: string, fgSituacao: number, accumulated: boolean) {
    let { dateValue, notBilledDateValue, monthlyGoal, dailyGoal } = await this.dailyGenerator(cds, yearMonth, fgSituacao, 'team')
    let goalValues: number[] // = GoalUtils.calculateGoal(revenueDateValue, dailyGoal)

    if (accumulated) {
      dateValue = GoalUtils.calculateAccumulate(dateValue)
      goalValues = GoalUtils.calculateGoalAccumulate(dateValue, dailyGoal, monthlyGoal) 
      notBilledDateValue = GoalUtils.calculateAccumulate(notBilledDateValue)
    } else {
      goalValues = GoalUtils.calculateGoal(dateValue,dailyGoal)
    }

    return {
      notBilledValues: notBilledDateValue.map(item => item.value),
      goal: monthlyGoal,
      goalValues,
      values: dateValue.map(i => i.value),
      dates: dateValue.map(i => i.date)
    }
  }
  
  async resumeSellerChart (cds: number[], yearMonth: string, fgSituacao: number, dates?: string[]): Promise<IRevenueResumeDTO> {
    const mapGoalRevenue = GoalRepository.goalSeller2map(
      await this.goalRepository.generateRevenue('seller', cds, yearMonth) as GoalSellers[]
    )

    let revenueResumeSellers: IRevenueResumeSeller[] = await this.repository.revenueResumeSellers(cds, [yearMonth], fgSituacao, dates)
    const revenueResume: IRevenueResumeDTO = { cds: [], labels: [], types: [], goalValues: [], values: [] }

    for (const resume of revenueResumeSellers) {
      const goalRevenue = mapGoalRevenue.get(resume.sellerCode)
      if (!goalRevenue) {
        throw new BadRequestException(`Seller "${resume.sellerName}" not found`)
      }

      revenueResume.cds.push(resume.sellerCode)
      revenueResume.values.push(resume.value)
      revenueResume.labels.push(resume.sellerName)
      revenueResume.types.push(1)
      // @ts-ignore
      revenueResume.goalValues.push(parseFloat(goalRevenue.goal ?? '0'))
    }

    return revenueResume
  }

  async resumeTeamChart (cds: number[] | number, yearMonth: string, fgSituacao: number, dates?: string[]): Promise<IRevenueResumeDTO> {
    let revenueResume: IRevenueResumeDTO = { cds: [], labels: [], types: [], goalValues: [], values: [] }
    const expandTeam = !Array.isArray(cds)
    cds = Array.isArray(cds) ? cds : [cds]

    if (expandTeam) {
      const sellers = (await this.teamService.sellersFromLeafTeams(cds)).map(seller => seller.cd)
      revenueResume = await this.resumeSellerChart(sellers, yearMonth, fgSituacao, dates)
      cds = (await this.teamService.teamsFromNonLeafTeams(cds)).map(team => team.cd)
    }

    const mapGoalRevenue = GoalRepository.goalTeam2map(
      await this.goalRepository.generateRevenue('team', cds, yearMonth) as GoalTeams[]
    )
    const { cds: sellersFromTeams } = await this.teamService.sellersFromTeams(...cds)
    const orderResume: IOrderResumeTeam[] = await this.repository.revenueResumeTeams(cds, sellersFromTeams, [yearMonth], fgSituacao, dates)

    for (const order of orderResume) {
      const goalRevenue = mapGoalRevenue.get(order.teamCode)
      if (!goalRevenue) {
        throw new BadRequestException(`Team "${order.teamName}" not found`)
      }

      revenueResume.cds.push(order.teamCode)
      revenueResume.labels.push(order.teamName)
      revenueResume.types.push(0)
      revenueResume.values.push(order.value)
      // @ts-ignore
      revenueResume.goalValues.push(parseFloat(goalRevenue.goal ?? '0'))
    }

    return revenueResume
  }
}
