import { Injectable } from "@nestjs/common";
import { ComparativeRepository } from "../comparative.interfaces";
import { GetYearMonthsService } from "../get-year-months/get-year-months.service";
import { ComparativeDTO, ComparativeOutputDTO } from "../comparative.dto";
import { Period } from "../get-year-months/types";
import ComparativeUtils from "../comparative.utils";

@Injectable()
export class PreviousExpandProductsUseCase {
  constructor (
    private queries: ComparativeRepository,
    private getYearMonthsService: GetYearMonthsService,
  ) { }

  async execute (dto: ComparativeDTO): Promise<ComparativeOutputDTO> {
    const getYearMonths = await this.getYearMonthsService.execute(dto.frequency, dto.yearMonth, dto.iterations, dto.iteration_mode)
    const orders = await this.queries.ordersByMonthExpandedProducts(dto.code, getYearMonths.yearMonths, dto.product_code)
    const labelsByCode: Record<number, string> = {}
    const comparativeMap: Record<string, Record<string, Record<'revenue'|'profit_value'|'cost_value'|'products_count', number>>> = {}
    const output: ComparativeOutputDTO = { labels: [], series: [] }
    const periods = Object.keys(getYearMonths.periods).sort()

    for (let order of orders) {
      labelsByCode[order.product_code] = order.product_label
      const period = getYearMonths.periodFromYearMonth[order.year_month]
      if (!comparativeMap[order.product_code]) {
        comparativeMap[order.product_code] = {}
        for (const periodKey of periods) {
          comparativeMap[order.product_code][periodKey] = ComparativeUtils.initialize()
        }
      }
      ComparativeUtils.add(comparativeMap[order.product_code][period.key], order)
    }

    for (const periodKey of periods) {
      const period = Period.factory(periodKey)
      output.labels.push(`${period.year}/${getYearMonths.periodsLabelsMap[dto.frequency][period.period]}`)
    }

    for (const productCode in comparativeMap) {
      const values = []
      for (const periodKey of periods) {
        values.push(ComparativeUtils.getValue(dto.data_mode, comparativeMap[productCode][periodKey]))
      }
      const serie_name = labelsByCode[productCode]
      output.series.push({
        data: values,
        name: serie_name,
        type: 'line'
      })
    }

    return output
  }
}
