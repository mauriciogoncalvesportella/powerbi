import {BadRequestException, Controller, Get, Inject, ParseArrayPipe, ParseBoolPipe, ParseIntPipe, Query, UseGuards} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import {UserDeactivatedGuard} from "src/auth/user-status/user-status.guard";
import {IdMesAnoValidationPipe} from "src/shared/id-mes-ano.pipe";
import {DateUtils} from "src/utils/date.utils";
import {IBaseDailyBarsChart, IBaseResumeChart} from "../sales.types";
import {RevenueGenerator} from './revenue.generator'

export interface IRevenueDailyBarsDTO extends IBaseDailyBarsChart {
  notBilledValues: number[]
}
export interface IRevenueResumeDTO extends IBaseResumeChart {}
export interface IRevenueGenerator {
  dailyTeamsChart (cds: number[], yearMonth: string, fgSituacao: number, accumulated: boolean): Promise<IRevenueDailyBarsDTO>;
  dailySellerChart (cds: number[], yearMonth: string, fgSituacao: number, accumulated: boolean): Promise<IRevenueDailyBarsDTO>;
  resumeSellerChart (cds: number[], yearMonth: string, fgSituacao: number, dates?: string[]): Promise<IRevenueResumeDTO>;
  resumeTeamChart (cds: number | number[], yearMonth: string, fgSituacao: number, dates?: string[]): Promise<IRevenueResumeDTO>;
}

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Role('user')
@Controller('/bi/sales/revenue')
export class RevenueController {
  constructor (
    @Inject(RevenueGenerator)
    private generator: IRevenueGenerator
  ) {}

  @Get('daily-chart')
  async getDailyBars (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',' }))
    cds: number[],
    @Query('yearMonth', new IdMesAnoValidationPipe(false))
    yearMonth: string,
    @Query('type')
    type: 'seller' | 'team',
    @Query('accumulated', new ParseBoolPipe())
    accumulated: boolean
  ) {
    if (!['seller', 'team'].includes(type))
      throw new BadRequestException('type must be \'teams\' or \'sellers\'')
    if (type === 'team') {
      return await this.generator.dailyTeamsChart(cds, yearMonth, 5, accumulated)
    }
    return await this.generator.dailySellerChart(cds, yearMonth, 5, accumulated)
  }

  @Get('resume-chart')
  async getResumeChart (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',', optional: true }))
    cds: number[],
    @Query('cd')
    cd: number,
    @Query('yearMonth', new IdMesAnoValidationPipe(false))
    yearMonth: string,
    @Query('type')
    type: 'seller' | 'team',
    @Query('initDay')
    initDay: number,
    @Query('endDay')
    endDay: number,
  ) {
    if (!cds && !cd) {
      throw new BadRequestException('\'cd\' or \'cds\' must be specified')
    }
    const dates = DateUtils.initEndFormat(initDay, endDay)
    if (type === 'team') {
      return await this.generator.resumeTeamChart(Number.isNaN(cd) ? cds : cd, yearMonth, 5, dates)
    } else {
      return await this.generator.resumeSellerChart(cds, yearMonth, 5)
    }
  }
}
