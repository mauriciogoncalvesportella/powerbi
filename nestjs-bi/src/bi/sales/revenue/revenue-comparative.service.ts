import {Inject, Injectable} from "@nestjs/common";
import {getDate} from "date-fns";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {DateUtils} from "src/utils/date.utils";
import {Connection, EntityManager} from "typeorm";
import {RevenueRepository} from "./revenue.repository";
import {ComparativeTeamDaily} from "./revenue.types";
import {RevenueUtils} from "./revenue.utils";

@Injectable()
export class RevenueComparativeService {
  private manager: EntityManager

  constructor (
    @Inject('CONNECTION')
    connection: Connection,
    private revenueRepository: RevenueRepository,
    private requestMetadata: RequestMetadata
  ) {
    this.manager = connection.manager
  }

  async daily (sellers: number[], idMesAnoInit: string, count: number, accumulated: boolean = false) {
    const closingDate = await this.requestMetadata.dtFechamento()
    const idMesAnoArr: string[] = DateUtils.yearMonthIterate(idMesAnoInit, count)
    const raw = await this.revenueRepository.fromSellersGroupByDate(sellers, idMesAnoArr, 5)
    const revenueArr = RevenueUtils.aggregateYearMonthRAWRevenue(idMesAnoArr, raw, closingDate)

    if (accumulated) {
      for (let i = 0; i < revenueArr.length; i++) {
        revenueArr[i] = RevenueUtils.calculateAccumulatedRevenue(revenueArr[i])
      }
    }

    const { value: maxDays, index } = revenueArr.reduce(
      (prev, curr, index) => curr.length > prev.value ? { value: curr.length, index } : prev,
      { value: -1, index: -1 }
    )

    const comparative: ComparativeTeamDaily = {
      yearMonthArr: idMesAnoArr,
      days: revenueArr[index].map(revenue => getDate(new Date(revenue.date))),
      valueSeries: []
    }

    if (comparative.days.length) {
      for (const revenue of revenueArr) {
        const values = revenue.map(item => item.value)
        if (values.length < maxDays) {
          const fillValue: number = accumulated ? (values.slice(-1)[0] ?? 0) : 0
          values.push(...new Array(maxDays - values.length).fill(fillValue))
        }
        comparative.valueSeries.push(values)
      }
    }

    return comparative 
  }
}
