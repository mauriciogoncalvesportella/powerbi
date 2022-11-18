import {Injectable} from "@nestjs/common";
import {TeamService} from "../team/team.service";
import {RevenueRepository} from "./revenue.repository";
import {RevenueFromTeamDTO} from "./revenue.types";
import {RevenueUtils} from "./revenue.utils";

@Injectable()
export class RevenueService {
  constructor(
    private revenueRepository: RevenueRepository,
    private teamService: TeamService,
  ) {}

  async getRevenueFromSellers (cds: number[], yearMonthArr: string[]) {
    return await this.revenueRepository.fromSellersGroupBySeller(cds, yearMonthArr, 5)
  }

  async getRevenueFromTeams (cds: number[], yearMonthArr: string[]) {
    const imediateTeams = await this.teamService.imediateTeams(cds)
    const imediateTeamsCds = imediateTeams.map(team => team.cd)
    const teams = [...cds, ...imediateTeamsCds]
    const { cds: sellerCds } = await this.teamService.sellersFromTeams(...teams)
    const raw = await this.revenueRepository.fromSellersAndTeamGroupBySeller(teams, sellerCds, yearMonthArr, 5)
    const revenue: RevenueFromTeamDTO[] = []
    const mapRevenue: { [cd: number]: number } = {}
    const accumulated = RevenueUtils.accumulatedTeams([], raw)

    for (const teamCode of cds) {
      const childTeams = imediateTeams
        .filter(team => team.cdEquipePai === teamCode && accumulated[team.cd] > 0)
        .map(team => ({
          teamCode: team.cd,
          value: accumulated[team.cd],
          teamName: team.nmEquipe,
        }))

      revenue.push({
        teamCode: teamCode,
        value: accumulated[teamCode] ?? -1,
        sellersValue: 0,
        childTeams,
        sellers: [],
      })
      mapRevenue[teamCode] = revenue.length - 1
    }

    for (const seller of raw) {
      if (cds.includes(seller.teamCode)) {
        const index = mapRevenue[seller.teamCode]
        revenue[index].sellersValue += seller.value
        revenue[index].sellers.push({
          sellerCode: seller.sellerCode,
          value: seller.value
        })
      }
    }
    return revenue
  }
}
