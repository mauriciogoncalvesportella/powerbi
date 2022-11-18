import {BadRequestException, Inject, Injectable} from "@nestjs/common";
import {UserAuth} from "src/auth/auth.interfaces";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {Connection, EntityManager, In} from "typeorm";
import {TeamService} from "../team/team.service";
import {TeamsWithGoal} from "../team/team.types";
import {RAWRevenueMonthlySeller, RevenueMonthlyDTO, RevenueMonthlyTeamsDTO} from "./revenue.types";
import {RevenueRepository} from "./revenue.repository";
import {RAWRevenueSellerTeam} from "./revenue.types";
import {RevenueUtils} from "./revenue.utils";
import {SellerService} from "../team/seller.service";
import {addDays, differenceInBusinessDays, getDay, lastDayOfMonth} from "date-fns";

@Injectable()
export class RevenueMonthlyService {
  private manager: EntityManager

  constructor (
    @Inject('CONNECTION')
    connection: Connection,
    private requestMetadata: RequestMetadata,
    private teamService: TeamService,
    private revenueRepository: RevenueRepository,
    private sellerService: SellerService
  ) {
    this.manager = connection.manager
  }

  get user () {
    return this.requestMetadata.user as UserAuth
  }

  differenceInBusinessDays (init: Date, end: Date): number {
    let count = 0
    let date = init
    do {
      if (![0, 6].includes(getDay(date))) {
        ++count
      }
      date = addDays(date, 1) 
    } while (date <= end)
    return count
  }

  async fromTeams (cdArr: number[], idMesAno: string, dates: string[] = null): Promise<RevenueMonthlyDTO> {
    const { mapTeamWithGoal, teams: teamEntities } = await this.teamService
      .teamsWithGoal(idMesAno, ...cdArr)

    const { cds: sellers } = await this.teamService.sellersFromTeams(...cdArr)

    let raw: RAWRevenueSellerTeam[] = await this.revenueRepository
      .fromSellersAndTeamGroupBySeller(cdArr, sellers, [idMesAno], 5, dates)

    const revenueMonthly: RevenueMonthlyDTO = { cds: [], labels: [], values: [], goalValues: [], types: [] }
    const customDates: boolean = (dates != null && dates[0] != null && dates[1] != null)
    const accumulated = RevenueUtils.accumulatedTeams(teamEntities, raw)

    let totalDays: number = 0
    let intervalDays: number = 0

    if (customDates) {
      intervalDays = this.differenceInBusinessDays(new Date(dates[0]), new Date(dates[1]))
      const firstDay = new Date(`${idMesAno}-01`)
      const lastDay = lastDayOfMonth(firstDay)
      totalDays = this.differenceInBusinessDays(firstDay, lastDay)
    }

    for (const key in accumulated) {
      const teamWithGoal = mapTeamWithGoal.get(parseInt(key))
      revenueMonthly.values.push(accumulated[key])
      revenueMonthly.types.push(0)
      revenueMonthly.labels.push(teamWithGoal.team.nmEquipe)
      revenueMonthly.cds.push(teamWithGoal.team.cd)
      revenueMonthly.goalValues.push(customDates
        ? (teamWithGoal.goal.vlMetaVenda/totalDays) * intervalDays
        : teamWithGoal.goal.vlMetaVenda)
    }

    return revenueMonthly
  }

  async fromSellers (cdArr: number[], idMesAno: string, dates: string[] = null): Promise<RevenueMonthlyDTO> {
    const { mapSellerWithGoal } = await this.sellerService.sellersWithGoal(idMesAno, cdArr)
    let raw: RAWRevenueMonthlySeller[] = await this.revenueRepository
      .fromSellersGroupBySeller(cdArr, [idMesAno], 5, dates)

    const revenueMonthly: RevenueMonthlyDTO = { cds: [], labels: [], values: [], goalValues: [], types: [] }
    const customDates: boolean = (dates != null && dates[0] != null && dates[1] != null)
    let totalDays: number = 0
    let intervalDays: number = 0

    if (customDates) {
      intervalDays = this.differenceInBusinessDays(new Date(dates[0]), new Date(dates[1]))
      const firstDay = new Date(`${idMesAno}-01`)
      const lastDay = lastDayOfMonth(firstDay)
      totalDays = this.differenceInBusinessDays(firstDay, lastDay) 
    }
  
    for (const seller of raw) {
      const sellerWithGoal = mapSellerWithGoal.get(seller.sellerCode)
      if (!sellerWithGoal) {
        throw new BadRequestException(`Seller "${seller.sellerName}" not found`)
      }
      revenueMonthly.cds.push(seller.sellerCode)
      revenueMonthly.values.push(seller.value)
      revenueMonthly.labels.push(seller.sellerName)
      revenueMonthly.types.push(1)
      revenueMonthly.goalValues.push(customDates
        ? (sellerWithGoal.goal/totalDays) * intervalDays
        : sellerWithGoal.goal)
    }

    return revenueMonthly
  }
}
