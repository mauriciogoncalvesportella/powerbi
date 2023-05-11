import { Injectable } from "@nestjs/common";
import { ComparativeRepository } from "./comparative.interfaces";
import { ComparativeDTO } from "./comparative.dto";
import { GetYearMonthsService } from "./get-year-months/get-year-months.service";
import { GetYearMonthsReturn, Period } from "./get-year-months/types";
import { TeamUtilsService } from "../team-utils/team-utils.service";

enum ComparativeStrategies {
  PERIODS,
  PREVIOUS,
  PREVIOUS_EXPANDED
}

@Injectable()
export class ComparativeUseCases {
  constructor (
    private queries: ComparativeRepository,
    private getYearMonthsService: GetYearMonthsService,
    private teamUtils: TeamUtilsService
  ) { }

  electStrategy (dto: ComparativeDTO): ComparativeStrategies {
    if (dto.byPeriods) {
      return ComparativeStrategies.PERIODS
    }
    if (dto.type === 'team' && dto.expand_team) {
      return ComparativeStrategies.PREVIOUS_EXPANDED
    }
    return ComparativeStrategies.PREVIOUS
  }

  async execute (dto: ComparativeDTO) {
    const getYearMonths = await this.getYearMonthsService.execute(dto.frequency, dto.iterations, dto.byPeriods)
    const strategy = this.electStrategy(dto)

    if (strategy === ComparativeStrategies.PERIODS) {
      return this.periods(dto, getYearMonths)
    }

    if (strategy === ComparativeStrategies.PREVIOUS) {
      return this.previous(dto, getYearMonths)
    }

    return this.previousExpandTeams(dto, getYearMonths)
  }

  private async previous (dto: ComparativeDTO, getYearMonths: GetYearMonthsReturn) {
    const orders = await this.queries.ordersByMonth(dto.code, dto.type, getYearMonths.yearMonths)
    const values = []
    const labels = []
    const comparativeMap: Record<string, number> = {}

    for (const periodKey in getYearMonths.periods) {
      comparativeMap[periodKey] = 0
    }

    for (const order of orders) {
      const period = getYearMonths.periodFromYearMonth[order.year_month]
      comparativeMap[period.key] += order.revenue
    }

    for (const periodKey in comparativeMap) {
      const period = Period.factory(periodKey)
      const value = comparativeMap[periodKey]
      values.push(value)
      labels.push(`${period.year}/${getYearMonths.periodsLabelsMap[dto.frequency][period.period]}`)
    }

    return {
      values,
      labels
    }
  }

  private async periods (dto: ComparativeDTO, getYearMonths: GetYearMonthsReturn) {
    const orders = await this.queries.ordersByMonth(dto.code, dto.type, getYearMonths.yearMonths)
    const monthsLabels = getYearMonths.periodsLabelsMap['monthly']
    const comparativeMap: Record<string, Record<string, number>> = {}
    const series = []
    const series_names = []
    const labels = []

    for (const periodKey in getYearMonths.periods) {
      const months = getYearMonths.periodsMonths[periodKey]
      comparativeMap[periodKey] = {}
      for (const month of months) {
        comparativeMap[periodKey][month] = 0
      }
    }

    for (const order of orders) {
      const period = getYearMonths.periodFromYearMonth[order.year_month]
      comparativeMap[period.key][order.month] += order.revenue
    }

    for (const periodKey in comparativeMap) {
      const monthValues = comparativeMap[periodKey]
      const period = Period.factory(periodKey)
      const values = []

      if (labels.length === 0) {
        for (const month in monthValues) {
          labels.push(monthsLabels[parseInt(month)])
        }
      }

      for (const month in monthValues) {
        values.push(monthValues[month])
      }

      series.push(values)
      series_names.push(`${period.year}`)
    }

    return {
      series,
      series_names,
      labels
    }
  }

  private async previousExpandTeams (dto: ComparativeDTO, getYearMonths: GetYearMonthsReturn) {
    const orders = await this.queries.ordersByMonthExpanded(dto.code, getYearMonths.yearMonths)
    const expandTeam = await this.teamUtils.expandTeam(dto.code)
    const comparativeMap: Record<string, Record<string, number>> = {}
    const series = []
    const labels = []
    const series_names = []

    const teams = Object.keys(expandTeam.teams).map(team => parseInt(team))
    const sellers = Object.keys(expandTeam.sellersEntities).map(seller => parseInt(seller))
    series_names.push(...teams.filter(team => expandTeam.teams[team].type === 'parent').map(team => `team_${team}`))
    series_names.push(...sellers.map(seller => `seller_${seller}`))
    
    for (const key of series_names) {
      comparativeMap[key] = {}
      for (const periodKey in getYearMonths.periods) {
        comparativeMap[key][periodKey] = 0
      }
    }

    for (const order of orders) {
      const period = getYearMonths.periodFromYearMonth[order.year_month]
      // let key: string = ''
      const seller = expandTeam.sellersEntities[order.seller_code]
      const team = expandTeam.teams[order.team_code]
      const key = seller
        ? `seller_${order.seller_code}`
        : team.parent_team
        ? `team_${order.team_code}`
        : `team_${team.parent_team}`
      comparativeMap[key][period.key] += order.revenue
    }

    for (const teamKey in comparativeMap) {
      const values = []

      for (const periodKey in comparativeMap[teamKey]) {
        values.push(comparativeMap[teamKey][periodKey])
      }

      if (labels.length === 0) {
        for (const periodKey in comparativeMap[teamKey]) {
          const period = Period.factory(periodKey)
          labels.push(`${period.year}/${getYearMonths.periodsLabelsMap[dto.frequency][period.period]}`)
        }
      }

      series.push(values)
    }

    const series_names_labels = series_names.map((teamOrSeller: string) => {
      const type = teamOrSeller.split('_')[0]
      const code = parseInt(teamOrSeller.split('_')[1])
      
      if (type === 'seller') {
        return expandTeam.sellersEntities[code].label
      }

      return expandTeam.teamEntities[code].label
    })

    return {
      series,
      series_names: series_names_labels,
      labels
    }
  }
}