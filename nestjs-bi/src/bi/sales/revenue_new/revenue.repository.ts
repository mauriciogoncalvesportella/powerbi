import {Injectable} from "@nestjs/common";
import {OrderRepository} from "../order.repository";
import {IRevenueDateValue, IRevenueRepository, IRevenueResumeSeller, IRevenueResumeTeam} from "./revenue.generator";

@Injectable()
export class RevenueRepository extends OrderRepository implements IRevenueRepository {
  async revenueGroupByDate (sellers: number[], yearMonth: string[], fgSituacao: number, dateQuery: 'dtEntrega' | 'dtEmissao' = 'dtEntrega'): Promise<IRevenueDateValue[]> {
    const data = await this.groupByDate(
      sellers,
      yearMonth,
      fgSituacao,
      'SUM (pedido.vlProdutos - pedido.vlDesconto - pedido.vlRapel)',
      dateQuery
    )
    return data.map(item => ({ value: item.value, date: item.date }))
  }

  async revenueResumeTeams (teams: number[], sellers: number[], yearMonth: string[], fgSituacao: number, dates: string[]): Promise<IRevenueResumeTeam[]> {
    return await this.groupByTeams(
      teams,
      sellers,
      yearMonth,
      fgSituacao,
      'SUM (pedido.vlProdutos - pedido.vlDesconto - pedido.vlRapel)',
      false,
      dates
    )
  }

  async revenueResumeSellers (sellers: number[], yearMonth: string[], fgSituacao: number, dates: string[]): Promise<IRevenueResumeSeller[]> {
    return await this.groupBySellers(
      sellers,
      yearMonth,
      fgSituacao,
      'SUM (pedido.vlProdutos - pedido.vlDesconto - pedido.vlRapel)',
      dates
    )
  }
}
