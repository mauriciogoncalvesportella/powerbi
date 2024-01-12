import {Inject, Injectable} from "@nestjs/common";
import {format} from "date-fns";
import {create} from "lodash";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {ILinearityGenerator, PerCustomerLinearityDTO, PerCustomerLinearityItem, ResumeLinearityDTO, ResumePotentitalLinearityDTO} from "./linearity.controller";
import {LinearityQueries} from './linearity.queries'
const _ = require('lodash')

export interface QueryResultPerCustomer {
  year_month: string,
  create_date: string,
  customer_code: number,
  customer_name: string,
  seller_name: string,
  status: number,
  new_customer: boolean,
  cost_value: number,
  profit_value: number,
  not_billed: number,
  billed: number
}

export interface ILinearityQueries {
  monthPerCustomer (cd: number, type: 'seller' | 'team', yearMonthInterval: string[]): Promise<QueryResultPerCustomer[]>
}

interface AggregatePerCustomer {
  customer_code: number,
  customer_name: string,
  create_date: string,
  seller_name: string,
  start_month: string,
  count: number,
  status: number,
  new_customer: boolean,
  total: { cost_value: number, profit_value: number, not_billed: number, billed: number },
  monthly: Record<string, { cost_value: number, profit_value: number, not_billed: number, billed: number }>
}

@Injectable()
export class LinearityGenerator implements ILinearityGenerator {
  constructor (
    @Inject(LinearityQueries)
    private queries: ILinearityQueries,
    private requestMetadata: RequestMetadata
  ) {}

  linearityLabel = {
    5: 'Excelente',
    4: 'Bom',
    3: 'Regular',
    2: 'Ruim',
    1: 'Péssimo',
    0: 'Novos',
  }

  private async aggregate (queryResult: QueryResultPerCustomer[]): Promise<AggregatePerCustomer[]> {
    const map: Record<string, AggregatePerCustomer> = {}
    const result: AggregatePerCustomer[] = []
    const currentYearMonth = await this.requestMetadata.getYearMonth(new Date())

    for (const item of queryResult) {
      if (item.billed + item.not_billed !== 0) {
        const isNewRecord = map[item.customer_code] == null
        const aggregateItem: AggregatePerCustomer = map[item.customer_code] ?? {
          customer_code: item.customer_code,
          customer_name: item.customer_name,
          create_date: item.create_date,
          seller_name: item.seller_name,
          start_month: item.year_month,
          status: item.status,
          new_customer: item.new_customer,
          count: 0,
          total: { cost_value: 0, profit_value: 0, not_billed: 0, billed: 0 },
          monthly: {},
        }

        if (currentYearMonth !== item.year_month) {
          aggregateItem.count++
        }

        aggregateItem.total.cost_value += item.cost_value
        aggregateItem.total.profit_value += item.profit_value
        aggregateItem.total.not_billed += item.not_billed
        aggregateItem.total.billed += item.billed
        aggregateItem.start_month = item.year_month < aggregateItem.start_month ? item.year_month : aggregateItem.start_month
        aggregateItem.monthly[item.year_month] = {
          cost_value: item.cost_value,
          profit_value: item.profit_value,
          not_billed: item.not_billed,
          billed: item.billed
        }

        map[item.customer_code] = aggregateItem
        if (isNewRecord) {
          result.push(aggregateItem)
        }
      }
    }

    return result
  }
  
  async resume (cd: number, type: 'seller' | 'team', yearMonthInterval: string[]): Promise<ResumeLinearityDTO> {
    const queryResult = await this.queries.monthPerCustomer(cd, type, yearMonthInterval)
    const aggregate = await this.aggregate(queryResult)
    const countMap: Record<number, number> = {}
    const resume: ResumeLinearityDTO = { values: [], count: [], labels: [] }

    for (const agg of aggregate) {
      const countKey = Math.min(agg.new_customer ? 0 : agg.count, 5).toString()
      countMap[countKey] = (countMap[countKey] ?? 0) + 1
    }

    for (const count of Object.keys(countMap).reverse()) {
      resume.count.push(parseInt(count))
      resume.values.push(countMap[count])
      resume.labels.push(this.linearityLabel[count])
    }

    return resume
  }

  async resumePotential (cd: number, type: 'seller' | 'team', yearMonthInterval: string[]): Promise<ResumePotentitalLinearityDTO> {
    const queryResult = await this.queries.monthPerCustomer(cd, type, yearMonthInterval)
    const aggregate = await this.aggregate(queryResult)
    const countMap: Record<string, { value: number, foreseen: number, count: number }> = {}
    const resume: ResumePotentitalLinearityDTO = { values: [], labels: [], goal_values: [], count: [] }

    for (const agg of aggregate) {
      const countKey = Math.min(agg.new_customer ? 0 : agg.count, 5).toString()
      countMap[countKey] = countMap[countKey] ?? { value: 0, foreseen: 0, count: 0 }
      countMap[countKey].value += (agg.total.billed + agg.total.not_billed)
      countMap[countKey].foreseen += agg.new_customer
        ? 0
        : 5 * (agg.total.not_billed + agg.total.billed) / agg.count 
      countMap[countKey].count++
    }

    for (const count of Object.keys(countMap).reverse()) {
      resume.count.push(parseInt(count))
      resume.values.push(countMap[count].value)
      resume.goal_values.push(countMap[count].foreseen)
      resume.labels.push(this.linearityLabel[count])
    }

    return resume
  }

  async perCustomer (cd: number, type: 'seller' | 'team', yearMonthInterval: string[], countFilter: number, sortColumn: string, sortType: string, offset: number, limit: number): Promise<PerCustomerLinearityDTO> {
    const currentYearMonth = await this.requestMetadata.getYearMonth(new Date())
    const queryResult = await this.queries.monthPerCustomer(cd, type, yearMonthInterval)

    const transformMonthly = (monthly: Record<string, any>) => {
      const ret = {}
      for (const key in monthly) {
        ret[key] = monthly[key].billed + monthly[key].not_billed
      }
      return ret
    }

    const aggregate: PerCustomerLinearityItem[] = (await this.aggregate(queryResult))
      .filter(agg => agg.start_month < currentYearMonth)
      .map(agg => ({
        customer_code: agg.customer_code,
        customer_name: agg.customer_name,
        seller_name: agg.seller_name,
        create_date: agg.create_date,
        count: agg.count,
        status: agg.status,
        new_customer: agg.new_customer,
        total_amount: agg.total.billed + agg.total.not_billed,
        current_amount: (agg.monthly[currentYearMonth]?.not_billed ?? 0) + (agg.monthly[currentYearMonth]?.billed ?? 0),
        monthly: transformMonthly(agg.monthly)
      }))
      .filter(agg => countFilter === -1 || (countFilter === 0 && agg.new_customer) || (agg.count === countFilter && !agg.new_customer))

    const sort = sortType === 'ASC' ? 1 : -1
    const isYearMonthSort = sortColumn.match(/^\d{4}-\d{2}$/)

    aggregate.sort((a, b) => {
      if (isYearMonthSort) {
        return sort * ((a.monthly[sortColumn] ?? 0) - (b.monthly[sortColumn] ?? 0))
      } if (sortColumn === 'customer_name') {
        return sort * a.customer_name.trim().localeCompare(b.customer_name.trim())
      } else if (sortColumn === 'total_amount') {
        return sort * (a.total_amount - b.total_amount)
      } else if (sortColumn === 'current_amount') {
        return sort * (a.current_amount - b.current_amount)
      } else if (sortColumn === 'average_amount') {
        return sort * (((a.total_amount - a.current_amount) / a.count) - ((b.total_amount - b.current_amount) / b.count))
      }
    })

    return {
      total: aggregate.length, 
      data: aggregate.slice(offset, offset + limit),
    }
  }
}
