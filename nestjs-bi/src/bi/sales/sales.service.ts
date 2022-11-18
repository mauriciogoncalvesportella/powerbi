import {Injectable} from "@nestjs/common";
import {SalesRepository} from "./sales.repository";
import {TeamService} from "./team/team.service";

@Injectable()
export class SalesService {
  constructor(
    private salesRepository: SalesRepository,
    private teamService: TeamService
  ) {}

  async getOrdersFromTeams (cds: number[], init: string, end: string) {
    const dtInit = `${init} 00:00`
    const dtEnd = `${end} 23:59`
    const { cds: sellerCds } = await this.teamService.sellersFromTeams(...cds)
    return this.salesRepository.orderFromSellers(sellerCds, dtInit, dtEnd)
  }

  async getOrdersFromSellers (cds: number[], init: string, end: string) {
    const dtInit = `${init} 00:00`
    const dtEnd = `${end} 23:59`
    return this.salesRepository.orderFromSellers(cds, dtInit, dtEnd)
  }

  async getOrdersFromSellersYearMonth (cds: number[], yearMonth: string) {
    return this.salesRepository.orderFromSellersYearMonth(cds, yearMonth)
  }

  async getOrderProducts (cdOrder: number) {
    return this.salesRepository.orderProducts(cdOrder)
  }
}
