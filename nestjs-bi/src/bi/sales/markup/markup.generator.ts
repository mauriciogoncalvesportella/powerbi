import { BadRequestException, Inject, Injectable, NotImplementedException } from "@nestjs/common";
import { RequestMetadata } from "src/shared/request-metadata.provider";
import { IBaseDateValue, IBaseResumeChart } from "../sales.types";
import { SellerService } from "../team/seller.service";
import { TeamService } from "../team/team.service";
import { DateValueUtils } from "../utils/date-value.utils";
import { IMarkupDailyBarsDTO, IMarkupGenerator, IMarkupResumeDTO } from "./markup.controller";
import { MarkupRepository } from './markup.repository'
import { MapTeamWithGoal } from '../team/team.types'
import {GoalUtils} from "../utils/goal.utils";
import {IOrderResumeTeam, IOrderResumeSeller, OrderRepository} from "../order.repository";
import {lastDayOfMonth} from "date-fns";
import {GoalRepository, GoalSellers, GoalTeams} from "../goal.repository";
import { cloneDeep } from 'lodash'

export interface IMarkupDateValue extends IBaseDateValue {}
export interface IMarkupResumeSeller extends IOrderResumeSeller {}
export interface IMarkupResumeTeam extends IOrderResumeTeam {}

export interface IMarkupRepository {
  markupGroupByDate (
    sellers: number[],
    yearMonth: string[],
    fgSituacao: number
  ): Promise<IMarkupDateValue[]>;

  markupResumeTeams (
    teams: number[],
    sellers: number[],
    yearMonth: string[],
    fgSituacao: number,
    dates: string[]
  ): Promise <IMarkupResumeTeam[]>;

  markupResumeSellers (
    sellers: number[],
    yearMonth: string[],
    fgSituacao: number,
    dates: string[]
  ): Promise <IMarkupResumeSeller[]>;
}

@Injectable()
export class MarkupGenerator implements IMarkupGenerator {
  constructor (
    @Inject(MarkupRepository)
    private repository: IMarkupRepository,
    private teamService: TeamService,
    private sellerService: SellerService,
    private requestMetadata: RequestMetadata,
    private goalRepository: GoalRepository
  ) {}

  static unionMarkupResume (markupResume0: IMarkupResumeDTO, markupResume1: IMarkupResumeDTO): IMarkupResumeDTO {
    const markupResume = cloneDeep(markupResume0)
    for (let i = 0; i < markupResume1.cds.length; i++) {
      markupResume.cds.push(markupResume1.cds[i])
      markupResume.goalValues.push(markupResume1.goalValues[i])
      markupResume.values.push(markupResume1.values[i])
      markupResume.types.push(markupResume1.types[i])
      markupResume.labels.push(markupResume1.labels[i])
    }
    return markupResume
  }

  private async dailyGenerator (cds: number[], yearMonth: string, fgSituacao: number, type: 'team' | 'seller') {
    const closingDate = await this.requestMetadata.dtFechamento()
    let monthlyGoal: number = 0
    let markupDateValue: IMarkupDateValue[]
    let cdArr: number[] = []
    let mapTeamWithGoal: MapTeamWithGoal = null

    switch (type) {
      case 'seller':
        const sellersWithTeam = await this.sellerService.sellersWithTeam(cds)
        const teams = sellersWithTeam.map(it => it.teamCode)
        mapTeamWithGoal = (await this.teamService.teamsWithGoal(yearMonth, ...teams)).mapTeamWithGoal
        cdArr = cds
        break;

      case 'team':
        cdArr = (await this.teamService.sellersFromTeams(...cds)).cds
        mapTeamWithGoal = (await this.teamService.teamsWithGoal(yearMonth, ...cds)).mapTeamWithGoal
        break;

      default:
        throw new NotImplementedException('type !== \'teams\' | \'sellers\' not implemented')
    }

    mapTeamWithGoal.forEach((value) => {
      // @ts-ignore
      monthlyGoal += parseFloat(value?.goal?.pcMetaMarkup ?? '0')
    })

    monthlyGoal = monthlyGoal / mapTeamWithGoal.size
    markupDateValue = await this.repository.markupGroupByDate(cdArr, [yearMonth], fgSituacao)
    markupDateValue = DateValueUtils.arrangeDatesRAWRevenue(markupDateValue, yearMonth, closingDate)

    return {
      monthlyGoal,
      markupDateValue
    }
  }

  async dailySellerChart (cds: number[], yearMonth: string, fgSituacao: number, accumulated: boolean): Promise<IMarkupDailyBarsDTO> {
    let { markupDateValue, monthlyGoal } = await this.dailyGenerator(cds, yearMonth, fgSituacao, 'seller')
    const goalValues = GoalUtils.calculateGoal(markupDateValue, monthlyGoal)
    
    if (accumulated) {
      markupDateValue = GoalUtils.calculateAccumulate(markupDateValue, true)
    }

    return {
      goal: monthlyGoal,
      goalValues,
      values: markupDateValue.map(item => item.value),
      dates: markupDateValue.map(item => item.date)
    }
  }

  async dailyTeamsChart (cds: number[], yearMonth: string, fgSituacao: number, accumulated: boolean): Promise<IMarkupDailyBarsDTO> {
    let { markupDateValue, monthlyGoal } = await this.dailyGenerator(cds, yearMonth, fgSituacao, 'team')
    const goalValues = GoalUtils.calculateGoal(markupDateValue, monthlyGoal)

    if (accumulated) {
      markupDateValue = GoalUtils.calculateAccumulate(markupDateValue, true)
    }

    return {
      goal: monthlyGoal,
      goalValues,
      values: markupDateValue.map(item => item.value),
      dates: markupDateValue.map(item => item.date)
    }
  }

  async resumeSellerChart (cds: number[], yearMonth: string, fgSituacao: number, dates?: string[]): Promise<IMarkupResumeDTO> {
    const mapGoalMarkup = GoalRepository.goalSeller2map(
      await this.goalRepository.generateMarkup('seller', cds, yearMonth) as GoalSellers[]
    )
    
    let markupResumeSellers: IMarkupResumeSeller[] = await this.repository.markupResumeSellers(cds, [yearMonth], fgSituacao, dates)
    const markupResume: IMarkupResumeDTO = { cds: [], labels: [], types: [], goalValues: [], values: [] }

    for (const resume of markupResumeSellers) {
      const goalMarkup = mapGoalMarkup.get(resume.sellerCode)
      if (!goalMarkup) {
        throw new BadRequestException(`Seller "${resume.sellerName}" not found`)
      }

      markupResume.cds.push(resume.sellerCode)
      markupResume.values.push(resume.value)
      markupResume.labels.push(resume.sellerName)
      markupResume.types.push(1)
      // @ts-ignore
      markupResume.goalValues.push(parseFloat(goalMarkup.goal ?? '0'))
    }

    return markupResume
  }

  async resumeTeamChart(cds: number[], yearMonth: string, fgSituacao: number, dates?: string[]): Promise<IMarkupResumeDTO> {
    let markupResume: IMarkupResumeDTO = { cds: [], labels: [], types: [], goalValues: [], values: [] }
    const expandTeam = cds.length === 1

    if (expandTeam) {
      const sellers = (await this.teamService.sellersFromLeafTeams(cds)).map(seller => seller.cd)
      markupResume = await this.resumeSellerChart(sellers, yearMonth, fgSituacao, dates)
      cds = (await this.teamService.teamsFromNonLeafTeams(cds)).map(team => team.cd)
    }

    const mapGoalMarkup = GoalRepository.goalTeam2map(
      await this.goalRepository.generateMarkup('team', cds, yearMonth) as GoalTeams[]
    )
    const { cds: sellersFromTeams } = await this.teamService.sellersFromTeams(...cds)
    const orderResume: IOrderResumeTeam[] = await this.repository.markupResumeTeams(cds, sellersFromTeams, [yearMonth], fgSituacao, dates)

    for (const order of orderResume) {
      const goalMarkup = mapGoalMarkup.get(order.teamCode)
      if (!goalMarkup) {
        throw new BadRequestException(`Team "${order.teamName}" not found`)
      }

      markupResume.cds.push(order.teamCode)
      markupResume.labels.push(order.teamName)
      markupResume.types.push(0)
      markupResume.values.push(order.value)
      // @ts-ignore
      markupResume.goalValues.push(parseFloat(goalMarkup.goal ?? '0'))
    }

    return markupResume
  }
}
