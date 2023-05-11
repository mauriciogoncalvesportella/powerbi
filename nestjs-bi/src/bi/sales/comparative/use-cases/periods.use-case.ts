import { Injectable } from "@nestjs/common";
import { ComparativeRepository } from "../comparative.interfaces";
import { GetYearMonthsService } from "../get-year-months/get-year-months.service";
import { TeamUtilsService } from "../../team-utils/team-utils.service";
import { ComparativeDTO, ComparativeOutputDTO } from "../comparative.dto";
import { Period } from "../get-year-months/types";
import ComparativeUtils from "../comparative.utils";

@Injectable()
export class PeriodsUseCase {
  constructor (
    private queries: ComparativeRepository,
    private getYearMonthsService: GetYearMonthsService,
    private teamUtils: TeamUtilsService
  ) { }

  async execute (dto: ComparativeDTO): Promise<ComparativeOutputDTO> {
    const getYearMonths = await this.getYearMonthsService.execute(dto.frequency, dto.iterations, dto.byPeriods)
    const orders = await this.queries.ordersByMonth(dto.code, dto.type, getYearMonths.yearMonths)
    const monthsLabels = getYearMonths.periodsLabelsMap['monthly']
    const comparativeMap: Record<string, Record<string, Record<'revenue'|'profit_value'|'cost_value', number>>> = {}
    const output: ComparativeOutputDTO = { labels: [], series: [] } 
    // const series = []
    // const series_names = []
    // const labels = []

    for (const periodKey in getYearMonths.periods) {
      const months = getYearMonths.periodsMonths[periodKey]
      comparativeMap[periodKey] = {}
      for (const month of months) {
        comparativeMap[periodKey][month] = ComparativeUtils.initialize()
      }
    }

    for (const order of orders) {
      const period = getYearMonths.periodFromYearMonth[order.year_month]
      ComparativeUtils.add(comparativeMap[period.key][order.month], order)
    }

    for (const periodKey in comparativeMap) {
      const monthValues = comparativeMap[periodKey]
      const period = Period.factory(periodKey)
      const values = []

      if (output.labels.length === 0) {
        for (const month in monthValues) {
          output.labels.push(monthsLabels[parseInt(month)])
        }
      }

      for (const month in monthValues) {
        values.push(ComparativeUtils.getValue(dto.data_mode, monthValues[month]))
      }

      output.series.push({
        data: values,
        name: `${period.year}`,
        type: 'line'
      })
    }

    if (dto.frequency === 'monthly') {
      return this.postExecuteMonthly(output)
    }

    return output
  }

  private postExecuteMonthly (output: ComparativeOutputDTO): ComparativeOutputDTO {
    const labels = output.series.map(serie => serie.name)
    const data = output.series.map(serie => serie.data[0])

    return {
      labels,
      series: [
        {
          type: 'line',
          data: data,
          name: output.labels[0]
        }
      ]
    }
  }

  /*
  private postExecuteMonthly (series: number[][], series_names: string[], labels: string[]) {
    const new_series = series.map(serie => serie[0])
    return {
      series_names: labels,
      labels: series_names,
      series: [new_series]
    }
  }
  */
}