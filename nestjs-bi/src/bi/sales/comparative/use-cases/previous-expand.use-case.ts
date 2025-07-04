import { Injectable } from "@nestjs/common";
import { ComparativeRepository } from "../comparative.interfaces";
import { GetYearMonthsService } from "../get-year-months/get-year-months.service";
import { TeamUtilsService } from "../../team-utils/team-utils.service";
import { ComparativeDTO, ComparativeOutputDTO } from "../comparative.dto";
import { Period } from "../get-year-months/types";
import ComparativeUtils from "../comparative.utils";

@Injectable()
export class PreviousExpandUseCase {
  constructor (
    private queries: ComparativeRepository,
    private getYearMonthsService: GetYearMonthsService,
    private teamUtils: TeamUtilsService
  ) { }

  async execute (dto: ComparativeDTO): Promise<ComparativeOutputDTO> {
    const getYearMonths = await this.getYearMonthsService.execute(dto.frequency, dto.yearMonth, dto.iterations, dto.iteration_mode)
    const orders = await this.queries.ordersByMonthExpanded(dto.code, dto.type, getYearMonths.yearMonths, dto.product_code)
    const expandTeam = await this.teamUtils.expandTeam(dto.code)
    const comparativeMap: Record<string, Record<string, Record<'revenue'|'profit_value'|'cost_value'|'products_count', number>>> = {}
    const output: ComparativeOutputDTO = { labels: [], series: [] }
    const series_names = []

    const teams = Object.keys(expandTeam.teams).map(team => parseInt(team))
    const sellers = Object.keys(expandTeam.sellersEntities).map(seller => parseInt(seller))
    series_names.push(...teams.filter(team => expandTeam.teams[team].type === 'parent').map(team => `team_${team}`))
    series_names.push(...sellers.map(seller => `seller_${seller}`))

    for (const key of series_names) {
      comparativeMap[key] = {}
      for (const periodKey in getYearMonths.periods) {
        comparativeMap[key][periodKey] = ComparativeUtils.initialize()
      }
    }

    for (const order of orders) {
      const period = getYearMonths.periodFromYearMonth[order.year_month]
      const seller = expandTeam.sellersEntities[order.seller_code]
      const parent_team = expandTeam.getParent[order.team_code]
      const key = seller
        ? `seller_${order.seller_code}`
        : `team_${parent_team}`

      ComparativeUtils.add(comparativeMap[key][period.key], order)
    }

    for (const teamKey in comparativeMap) {
      const values = []

      const periodsKeys = Object.keys(comparativeMap[teamKey])
      Period.sort(periodsKeys)
      for (const periodKey of periodsKeys) {
        values.push(ComparativeUtils.getValue(dto.data_mode, comparativeMap[teamKey][periodKey]))
      }

      if (output.labels.length === 0) {
        for (const periodKey of periodsKeys) {
          const period = Period.factory(periodKey)
          output.labels.push(`${period.year}/${getYearMonths.periodsLabelsMap[dto.frequency][period.period]}`)
        }
      }

      const type = teamKey.split('_')[0]
      const code = parseInt(teamKey.split('_')[1])
      const serie_name = type === 'seller'
        ? expandTeam.sellersEntities[code].label
        : expandTeam.teamEntities[code].label

      output.series.push({
        data: values,
        name: serie_name,
        type: 'line'
      })
    }

    return output
  }
}
