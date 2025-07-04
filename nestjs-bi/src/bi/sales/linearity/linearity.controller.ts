import {BadRequestException, Controller, Get, Inject, ParseIntPipe, Query, UseGuards} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import {UserDeactivatedGuard} from "src/auth/user-status/user-status.guard";
import { LinearityGenerator } from './linearity.generator'

export interface ResumeLinearityDTO {
  values: number[],
  labels: string[],
  count: number[]
}

export interface ResumePotentitalLinearityDTO {
  values: number[],
  goal_values: number[]
  labels: string[],
  count: number[]
}

export interface PerCustomerLinearityItem {
  customer_code: number,
  customer_name: string,
  seller_name: string,
  create_date: string,
  count: number,
  status: number,
  new_customer: boolean,
  total_amount: number,
  current_amount: number,
  monthly: Record<string, number>
}

export interface PerCustomerLinearityDTO {
  total: number,
  data: PerCustomerLinearityItem[]
}


export interface ILinearityGenerator {
  resume (cd: number, type: 'seller' | 'team', yearMonthInterval: string[]): Promise<ResumeLinearityDTO>
  resumePotential (cd: number, type: 'seller' | 'team', yearMonthInterval: string[]): Promise<ResumePotentitalLinearityDTO>
  perCustomer (cd: number, type: 'seller' | 'team', yearMonthInterval: string[], countFilter: number, sortColumn: string, sortType: string, offset: number, limit: number): Promise<PerCustomerLinearityDTO>
}

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Role('user')
@Controller('/bi/sales/linearity')
export class LinearityController {
  constructor (
    @Inject(LinearityGenerator)
    private generator: ILinearityGenerator
  ) {}

  @Get('resume-chart')
  async resumeChart (
    @Query('cd', ParseIntPipe) cd: number,
    @Query('type') type: string,
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    if (type != 'seller' && type != 'team') {
      throw new BadRequestException('type must be \'seller\' or \'team\'')
    }
    return this.generator.resume(cd, type, [start, end])
  }

  @Get('resume-potential-chart')
  async resumePotential (
    @Query('cd', ParseIntPipe) cd: number,
    @Query('type') type: string,
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    if (type != 'seller' && type != 'team') {
      throw new BadRequestException('type must be \'seller\' or \'team\'')
    }
    return this.generator.resumePotential(cd, type, [start, end])
  }

  @Get('per-customer')
  async perCustomer (
    @Query('cd', ParseIntPipe) cd: number,
    @Query('type') type: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('count-filter') countFilter: number,
    @Query('sort-column') sortColumn: string,
    @Query('sort-type') sortType: string,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number
  ) {
    offset = offset ?? 0
    limit = limit ?? 50
    if (type != 'seller' && type != 'team') {
      throw new BadRequestException('type must be \'seller\' or \'team\'')
    }

    const columns = ['customer_name', 'total_amount', 'average_amount', 'current_amount']
    if (sortColumn.match(/^\d{4}-\d{2}$/)) {
      const [, month] = sortColumn.split('-').map(it => parseInt(it))
      if (month < 1 || month > 12) {
        throw new BadRequestException(`invalid yearMonth '${sortColumn}'`)
      }
    } else if (!columns.includes(sortColumn)) {
      throw new BadRequestException(`sort-column must be one of ${columns}`)
    }

    if (sortType != 'ASC' && sortType != 'DESC') {
      throw new BadRequestException('sort-type must be \'ASC\' or \'DESC\')')
    }

    return this.generator.perCustomer(cd, type, [start, end], countFilter, sortColumn, sortType, offset, limit)
  }
}
