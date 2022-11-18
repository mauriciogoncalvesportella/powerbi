import {Inject, Injectable} from "@nestjs/common";
import {UserAuth} from "src/auth/auth.interfaces";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {TeamService} from "../team/team.service";
import {RevenueDTO} from "./revenue.types";
import {RevenueRepository} from "./revenue.repository";
import {RAWRevenue} from "./revenue.types";
import {RevenueUtils} from "./revenue.utils";
import {SellerService} from "../team/seller.service";

@Injectable()
export class RevenueDailyService {
  constructor (
    private requestMetadata: RequestMetadata,
    private teamService: TeamService,
    private revenueRepository: RevenueRepository,
    private sellerService: SellerService
  ) {}

  get user () {
    return this.requestMetadata.user as UserAuth
  }

  async fromSellers (cdArr: number[], idMesAno: string): Promise<RevenueDTO> {
    const { totalGoal: monthlyGoal } = await this.sellerService.sellersWithGoal(idMesAno, cdArr)
    let raw: RAWRevenue[] = await this.revenueRepository.fromSellersGroupByDate(cdArr, [idMesAno], 5)
    const closingDate = await this.requestMetadata.dtFechamento()
    raw = RevenueUtils.arrangeDatesRAWRevenue(raw, idMesAno, closingDate)
    const dailyGoal = RevenueUtils.calculateDailyGoal(raw, monthlyGoal)
    const goalValues = RevenueUtils.calculateGoal(raw, dailyGoal)

    return {
      goal: monthlyGoal,
      goalValues: goalValues,
      values: raw.map(item => item.value),
      dates: raw.map(item => item.date)
    }
  }

  async fromTeam (cdArr: number[], idMesAno: string): Promise<RevenueDTO> {
    cdArr = cdArr.length === 0 ? [this.user.cdEquipe] : cdArr
    const { goal: monthlyGoal } = await this.teamService.teamsWithGoal(idMesAno, ...cdArr)
    const { cds: sellers } = await this.teamService.sellersFromTeams(...cdArr)
    let raw: RAWRevenue[] = await this.revenueRepository.fromSellersGroupByDate(sellers, [idMesAno], 5)
    const closingDate = await this.requestMetadata.dtFechamento()
    raw = RevenueUtils.arrangeDatesRAWRevenue(raw, idMesAno, closingDate)
    const dailyGoal = RevenueUtils.calculateDailyGoal(raw, monthlyGoal)
    const goalValues = RevenueUtils.calculateGoal(raw, dailyGoal)

    return {
      dates: raw.map(item => item.date),
      values: raw.map(item => item.value),
      goalValues,
    } as RevenueDTO
  }

  async fromTeamAccumulated (cdArr: number[], idMesAno: string): Promise<RevenueDTO> {
    cdArr = cdArr.length === 0 ? [this.user.cdEquipe] : cdArr
    const { cds: sellers } = await this.teamService.sellersFromTeams(...cdArr)
    const { goal: monthlyGoal, teamsLeaf, teams } = await this.teamService.teamsWithGoal(idMesAno, ...cdArr)
    
    let raw: RAWRevenue[] = await this.revenueRepository.fromSellersGroupByDate(sellers, [idMesAno], 5)
    const closingDate = await this.requestMetadata.dtFechamento()
    raw = RevenueUtils.arrangeDatesRAWRevenue(raw, idMesAno, closingDate)
    const goalValues = RevenueUtils.calculateGoalAccumulate(raw, monthlyGoal)
    raw = RevenueUtils.calculateAccumulatedRevenue(raw)


    return {
      goal: monthlyGoal,
      goalValues,
      values: raw.map(item => item.value),
      dates: raw.map(item => item.date),
      meta: {
        teamsLeaf: teamsLeaf,
      }
    }
  }

  async fromSellersAccumulated (cdArr: number[], idMesAno: string): Promise<RevenueDTO> {
    cdArr = cdArr.length === 0 ? [this.user.cdVendedor] : cdArr
    const { totalGoal: monthlyGoal } = await this.sellerService.sellersWithGoal(idMesAno, cdArr)
    let raw: RAWRevenue[] = await this.revenueRepository.fromSellersGroupByDate(cdArr, [idMesAno], 5)
    const closingDate = await this.requestMetadata.dtFechamento()
    raw = RevenueUtils.arrangeDatesRAWRevenue(raw, idMesAno, closingDate)
    const goalValues = RevenueUtils.calculateGoalAccumulate(raw, monthlyGoal)
    raw = RevenueUtils.calculateAccumulatedRevenue(raw)

    return {
      goal: monthlyGoal,
      goalValues,
      values: raw.map(item => item.value),
      dates: raw.map(item => item.date)
    }
  } 
}
