import { Injectable } from "@nestjs/common";
import { ComparativeRepository } from "../comparative.interfaces";
import { GetYearMonthsService } from "../get-year-months/get-year-months.service";
import { ComparativeDTO, ComparativeOutputDTO } from "../comparative.dto";
import { Period } from "../get-year-months/types";
import ComparativeUtils from "../comparative.utils";

@Injectable()
export class PreviousUseCase {
  constructor (
    private queries: ComparativeRepository,
    private getYearMonthsService: GetYearMonthsService,
  ) { }

  async execute (dto: ComparativeDTO): Promise<ComparativeOutputDTO> {
    const getYearMonths = await this.getYearMonthsService.execute(dto.frequency, dto.yearMonth, dto.iterations, dto.iteration_mode)
    const orders = await this.queries.ordersByMonth(dto.code, dto.type, getYearMonths.yearMonths, dto.product_code)
    const comparativeMap: Record<string, Record<'revenue'|'profit_value'|'cost_value'|'products_count', number>> = {}
    const output: ComparativeOutputDTO = {
      labels: [],
      series: [{ data: [], name: 'comparativo', type: 'line' }]
    }

    for (const periodKey in getYearMonths.periods) {
      comparativeMap[periodKey] = ComparativeUtils.initialize()
    }

    for (const order of orders) {
      const period = getYearMonths.periodFromYearMonth[order.year_month]
      ComparativeUtils.add(comparativeMap[period.key], order)
    }

    const periodsKeys = Object.keys(comparativeMap)
    Period.sort(periodsKeys)

    for (const periodKey of periodsKeys) {
      const period = Period.factory(periodKey)
      const value = ComparativeUtils.getValue(dto.data_mode, comparativeMap[period.key])
      output.series[0].data.push(value)
      output.labels.push(`${period.year}/${getYearMonths.periodsLabelsMap[dto.frequency][period.period]}`)
    }

    return output
  }
}