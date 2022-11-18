import {Inject, Injectable} from "@nestjs/common";
import {addMonths, format} from "date-fns";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {ArrayUtils} from "src/utils/array.utils";
import {Connection} from "typeorm";
import {ComparativeQueries} from "./comparative.queries";
import {createComparativeSerie, ComparativeDTO, ComparativeSerieDTO, IComparativeGenerator, IComparativeQueries, IComparativeStrategy, IComparativeStrategyObject, QueryResultComparative} from "./comparative.types";
const _ = require('lodash')

@Injectable()
export class ComparativeGenerator implements IComparativeGenerator {
  constructor (
    @Inject('CONNECTION')
    private connection: Connection,
    @Inject(ComparativeQueries)
    private queries: IComparativeQueries,
  ) {  }

  get manager () {
    return this.connection.manager
  }

  private async getNormalizedQueryResult (interval: string[], getQueryResult: () => Promise<QueryResultComparative[]>): Promise<QueryResultComparative[]> {
    const getEntities = (values: QueryResultComparative[]) => {
      const mapEntities: Map<string, { code: number, type: 'seller' | 'team', label: string }> = new Map()
      const mapQueryResult: Map<string, QueryResultComparative> = new Map()
      for (const value of values) {
        mapEntities.set(`${value.code}_${value.type}`, { code: value.code, type: value.type, label: value.label })
        mapQueryResult.set(`${value.status}_${value.year_month}_${value.code}_${value.type}`, value)
      }
      return { mapEntities, mapQueryResult }
    }

    const values = await getQueryResult()
    const { mapEntities, mapQueryResult } = getEntities(values)
    let iterationDate = new Date(`${interval[0]}-01`)
    do {
      const yearMonth = format(iterationDate, 'yyyy-MM')
      for (const entityArr of Array.from(mapEntities)) {
        const value = entityArr[1]
        for (const status of ['billed', 'not_billed']) {
          if (!mapQueryResult.has(`${status}_${yearMonth}_${value.code}_${value.type}`)) {
            values.push({
              status: status as 'billed' | 'not_billed',
              year_month: yearMonth,
              code: value.code,
              type: value.type,
              label: value.label,
              market_value: 0,
              cost_value: 0,
              profit_value: 0
            })
          }
        }
      }
      iterationDate = addMonths(iterationDate, 1)
    } while (format(iterationDate, 'yyyy-MM') <= interval[1])

    values.sort((a, b) => {
      return a.year_month === b.year_month
        ? 0
        : a.year_month > b.year_month ? 1 : -1
    })
   
    return values
  }

  public async comparative (type: 'team' | 'seller', code: number, interval: string[], strategy: IComparativeStrategy): Promise<ComparativeDTO> { 
    const comparative: ComparativeDTO = { categories: [], series: [] }
    const categories: Set<string> = new Set()
    const comparativeMap: Map<string, ComparativeSerieDTO> = new Map()
    const checked: Map<string, boolean> = new Map()
    const queryResult = await this.getNormalizedQueryResult(interval, async () => {
      return type === 'team'
        ? await this.queries.comparativeTeam(code, interval)
        : await this.queries.comparativeSeller(code, interval)
    })

    const mapSumValues: Map<string, IComparativeStrategyObject> = new Map()
    for (const value of queryResult) {
      const key = `${value.code}_${value.type}_${value.year_month}`
      const mv = mapSumValues.get(key)?.market_value ?? 0
      const cv = mapSumValues.get(key)?.cost_value ?? 0
      const pv = mapSumValues.get(key)?.profit_value ?? 0

      mapSumValues.set(key, {
        market_value: value.market_value + mv,
        cost_value: value.cost_value + cv,
        profit_value: value.profit_value + pv
      })
    }

    for (const value of queryResult) {
      categories.add(value.year_month)

      const key = `${value.code}_${value.type}`
      if (!comparativeMap.has(key)) {
        const serie = createComparativeSerie(value.code, value.type, value.label)
        comparativeMap.set(key, serie)
        comparative.series.push(serie)
      }

      const serie = comparativeMap.get(key)
      const mapSumKey = `${key}_${value.year_month}`
      if (!checked.has(mapSumKey)) {
        checked.set(mapSumKey, true)
        serie.values.push(strategy.execute(mapSumValues.get(mapSumKey)))
      }
    }

    comparative.categories = Array.from(categories)
    comparative.series.sort((a, b) => {
      const rankingA = a.values.reduce((prev, curr) => prev + curr, 0)
      const rankingB = b.values.reduce((prev, curr) => prev + curr, 0)
      return rankingB - rankingA
    })
    comparative.series.sort((a, b) => {
      if (a.label > b.label) {
        return 1
      }
      if (a.label < b.label) {
        return -1
      }
      return 0
    })
    return comparative
  }

  static RevenueStrategy = class implements IComparativeStrategy {
    execute (row: IComparativeStrategyObject) {
      return row.market_value
    }
  }

  static MarkupStrategy = class implements IComparativeStrategy {
    execute (row: IComparativeStrategyObject) {
      return row.cost_value === 0
        ? 0
        : ((row.market_value/row.cost_value) - 1) * 100
    }
  }

  static ProfitStrategy = class implements IComparativeStrategy {
    execute (row: IComparativeStrategyObject) {
      return row.cost_value === 0
        ? 0
        : (row.profit_value/row.market_value) * 100
    }
  }
}
