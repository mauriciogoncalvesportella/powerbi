import { Injectable} from "@nestjs/common";
import { IOrderResumeSeller, IOrderResumeTeam, OrderRepository } from '../order.repository'
import { IMarkupDateValue, IMarkupRepository, IMarkupResumeSeller, IMarkupResumeTeam } from "./markup.generator";

@Injectable()
export class MarkupRepository extends OrderRepository implements IMarkupRepository {
  async markupGroupByDate (sellers: number[], yearMonth: string[], fgSituacao: number): Promise<IMarkupDateValue[]> {
    const data = await this.groupByDate(
      sellers,
      yearMonth,
      fgSituacao,
      'AVG (pedido.pcMarkup)'
    )
    return data.map(item => ({ value: item.value, date: item.date }))
  }

  async markupResumeTeams (teams: number[], sellers: number[], yearMonth: string[], fgSituacao: number, dates): Promise<IMarkupResumeTeam[]> {
    return await this.groupByTeams(
      teams,
      sellers,
      yearMonth,
      fgSituacao,
      'AVG (pedido.pcMarkup)',
      true,
      dates
    )
  }

  async markupResumeSellers (sellers: number[], yearMonth: string[], fgSituacao: number, dates: string[]): Promise<IMarkupResumeSeller[]> {
    return await this.groupBySellers(
      sellers,
      yearMonth,
      fgSituacao,
      'AVG (pedido.pcMarkup)',
      dates
    )
  }
}
