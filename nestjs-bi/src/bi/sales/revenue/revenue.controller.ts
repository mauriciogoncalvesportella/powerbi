import {BadRequestException, Controller, Get, Inject, Injectable, ParseBoolPipe, ParseIntPipe, Query, UseGuards} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import {UserDeactivatedGuard} from "src/auth/user-status/user-status.guard";
import {IdMesAnoValidationPipe} from "src/shared/id-mes-ano.pipe";
import {DateOrYearMonthParam} from "../sales.types";
import {RevenueGenerator} from "./revenue.generator";
import {IRevenueGenerator} from "./revenue.interfaces";
import { CheckUserRoles } from "src/auth/user-roles/check-user-roles.decorator";
import UserRoles from "src/auth/user-roles/user-roles.enum";

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Role('user')
@Controller('/bi/sales/revenue')
export class RevenueController {
  constructor (
    @Inject(RevenueGenerator)
    private generator: IRevenueGenerator
  ) {}

  @Get('profit-daily-chart')
  async getProfitDailyBars (
    @Query('cd', ParseIntPipe)
    cd: number,
    @Query('year-month', IdMesAnoValidationPipe)
    yearMonth: string,
    @Query('type')
    type: 'seller' | 'team',
    @Query('cumulative', new ParseBoolPipe())
    cumulative: boolean
  ) {
    if (!['seller', 'team'].includes(type))
      throw new BadRequestException('type must be \'teams\' or \'sellers\'')
    return this.generator.daily(cd, type, yearMonth, cumulative, new RevenueGenerator.ProfitStrategy)
  }

  @Get('markup-daily-chart')
  async getMarkupDailyBars (
    @Query('cd', ParseIntPipe)
    cd: number,
    @Query('year-month', IdMesAnoValidationPipe)
    yearMonth: string,
    @Query('type')
    type: 'seller' | 'team',
    @Query('cumulative', new ParseBoolPipe())
    cumulative: boolean
  ) {
    if (!['seller', 'team'].includes(type))
      throw new BadRequestException('type must be \'teams\' or \'sellers\'')
    return this.generator.daily(cd, type, yearMonth, cumulative, new RevenueGenerator.MarkupStrategy)
  }

  @CheckUserRoles(UserRoles.sales_revenue)
  @Get('revenue-daily-chart')
  async getRevenueDailyBars (
    @Query('cd', ParseIntPipe)
    cd: number,
    @Query('year-month', IdMesAnoValidationPipe)
    yearMonth: string,
    @Query('type')
    type: 'seller' | 'team',
    @Query('cumulative', new ParseBoolPipe())
    cumulative: boolean
  ) {
    if (!['seller', 'team'].includes(type))
      throw new BadRequestException('type must be \'teams\' or \'sellers\'')
    return await this.generator.daily(cd, type, yearMonth, cumulative, new RevenueGenerator.RevenueStrategy)
  }

  @Get('profit-resume-chart')
  async getProfitResume (
    @Query('team-code', ParseIntPipe)
    teamCode: number,
    @Query('year-month', new IdMesAnoValidationPipe(false))
    yearMonth: string,
    @Query('init-day')
    initDay: string,
    @Query('end-day')
    endDay: string
  ) {
    let dateOrYearMonthParam: DateOrYearMonthParam
    if (initDay && endDay) {
      dateOrYearMonthParam = new DateOrYearMonthParam('dates', [initDay, endDay])
    } else if (yearMonth) {
      dateOrYearMonthParam = new DateOrYearMonthParam('yearMonth', yearMonth)
    } else {
      throw new BadRequestException('initDay and endDay and yearMonth can\'t be null')
    }
    return this.generator.resume(teamCode, dateOrYearMonthParam, new RevenueGenerator.ProfitStrategy)
  }

  @Get('markup-resume-chart')
  async getMarkupResume (
    @Query('team-code', ParseIntPipe)
    teamCode: number,
    @Query('year-month', IdMesAnoValidationPipe)
    yearMonth: string,
    @Query('init-day')
    initDay: string,
    @Query('end-day')
    endDay: string
  ) {
    let dateOrYearMonthParam: DateOrYearMonthParam
    if (initDay && endDay) {
      dateOrYearMonthParam = new DateOrYearMonthParam('dates', [initDay, endDay])
    } else if (yearMonth) {
      dateOrYearMonthParam = new DateOrYearMonthParam('yearMonth', yearMonth)
    } else {
      throw new BadRequestException('initDay and endDay and yearMonth can\'t be null')
    }
    return this.generator.resume(teamCode, dateOrYearMonthParam, new RevenueGenerator.MarkupStrategy)
  }

  @Get('revenue-resume-chart')
  async getRevenueResume (
    @Query('team-code', ParseIntPipe)
    teamCode: number,
    @Query('year-month', IdMesAnoValidationPipe)
    yearMonth: string,
    @Query('init-day')
    initDay: string,
    @Query('end-day')
    endDay: string
  ) {
    let dateOrYearMonthParam: DateOrYearMonthParam
    if (initDay && endDay) {
      dateOrYearMonthParam = new DateOrYearMonthParam('dates', [initDay, endDay])
    } else if (yearMonth) {
      dateOrYearMonthParam = new DateOrYearMonthParam('yearMonth', yearMonth)
    } else {
      throw new BadRequestException('initDay and endDay and yearMonth can\'t be null')
    }
    return this.generator.resume(teamCode, dateOrYearMonthParam, new RevenueGenerator.RevenueStrategy)
  }
}
