import {Injectable, Inject} from "@nestjs/common";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {SellerService} from "../team/seller.service";
import {TeamService} from "../team/team.service";
import {DateValueUtils} from "../utils/date-value.utils";
import {GoalUtils} from "../utils/goal.utils";
import {DailyGoal, IRevenueGoals, ResumeGoal} from "./revenue.generator";
import {Connection, In} from "typeorm";
import {GoalService} from "../goal.service";

@Injectable()
export class RevenueGoals implements IRevenueGoals {
  constructor (
    private goalService: GoalService,
    private sellerService: SellerService,
    private teamService: TeamService,
    private requestMetadata: RequestMetadata,
    @Inject('CONNECTION')
    private connection: Connection,
  ) {}

  async dailyBySellers (sellers: number[], yearMonth: string): Promise<DailyGoal> {
    const monthly = (await this.sellerService.sellersWithGoal(yearMonth, sellers)).totalGoal
    const closinDate = await this.requestMetadata.dtFechamento()
    const dates = DateValueUtils.yearMonthBound(yearMonth, closinDate)
    const daily = GoalUtils._calculateDailyGoal(dates, monthly)
    return {
      daily,
      monthly
    }
  }

  async dailyByTeams (teams: number[], yearMonth: string): Promise<DailyGoal> {
    let monthly = 0
    const { mapTeamWithGoal } = await this.teamService.teamsWithGoal(yearMonth, ...teams)
    mapTeamWithGoal.forEach(value => {
      // @ts-ignore
      monthly += parseFloat(value?.goal?.vlMetaVenda ?? '0')
    })
    const closingDate = await this.requestMetadata.dtFechamento()
    const dates = DateValueUtils.yearMonthBound(yearMonth, closingDate)
    const daily = GoalUtils._calculateDailyGoal(dates, monthly)
    return {
      daily,
      monthly
    }
  }

  async resumeByTeams (teams: number[], dates: Date[]): Promise<Record<number, number>> {
    const byTeamsFromInterval = await this.goalService.byTeamsFromInterval(teams, dates)
    const result: Record<number, number> = {}
    for (const cd in byTeamsFromInterval) {
      result[cd] = 0
      for (const yearMonth in byTeamsFromInterval[cd]) {
        const { days, total, entity } = byTeamsFromInterval[cd][yearMonth]
        result[cd] += entity
          ? entity.vlMetaVenda * (days/total)
          : 0
      }
    }
    return result
  }

  async resumeBySellers (sellers: number[], dates: Date[]): Promise<Record<number, number>> {
    const bySellersFromInterval = await this.goalService.bySellersFromInterval(sellers, dates)
    const result: Record<number, number> = {}
    for (const cd in bySellersFromInterval) {
      result[cd] = 0
      for (const yearMonth in bySellersFromInterval[cd]) {
        const { days, total, entity } = bySellersFromInterval[cd][yearMonth]
        result[cd] += entity
          ? entity.vlMetaVenda * (days/total)
          : 0
      }
    }
    return result
  }
}
