import {BadRequestException, Controller, Get, Inject, ParseArrayPipe, ParseBoolPipe, Query, UseGuards} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import {UserDeactivatedGuard} from "src/auth/user-status/user-status.guard";
import {IdMesAnoValidationPipe} from "src/shared/id-mes-ano.pipe";
import {RequestMetadata} from "src/shared/request-metadata.provider";
import {IBaseDailyChart, IBaseResumeChart} from "../sales.dto";
import {RevenueGenerator} from './revenue.generator'

export interface IRevenueDailyDTO extends IBaseDailyChart {
  not_billed_values: number[]
}

export interface IRevenueResumeDTO extends IBaseResumeChart {
  not_billed_values: number[]
}

export interface IRevenueGenerator {
  dailyBySellersChart (cds: number[], yearMonth: string, cumulative: boolean): Promise<IRevenueDailyDTO>;
  dailyByTeamsChart (cds: number[], yearMonth: string, cumulative: boolean): Promise<IRevenueDailyDTO>;
  resumeByTeamsChart (cds: number[], yearMonth: string, dates?: Date[]): Promise<IRevenueResumeDTO>;
  resumeBySellersChart (cds: number[], yearMonth: string, dates?: Date[]): Promise<IRevenueResumeDTO>;
  resumeByTeamChart (cd: number, yearMonth: string, dates?: Date[]): Promise<IRevenueResumeDTO>;
}

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Role('user')
@Controller('/bi/sales/revenue_2')
export class RevenueController {
  constructor (
    @Inject(RevenueGenerator)
    private generator: IRevenueGenerator,
    private requestMetadata: RequestMetadata
  ) {}

  @Get('daily-chart')
  async getDailyBars (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',' }))
    cds: number[],
    @Query('yearMonth', new IdMesAnoValidationPipe(false))
    yearMonth: string,
    @Query('type')
    type: 'seller' | 'team',
    @Query('cumulative', new ParseBoolPipe())
    cumulative: boolean
  ) {
    if (!['seller', 'team'].includes(type))
      throw new BadRequestException('type must be \'teams\' or \'sellers\'')
    if (type === 'team') {
      return await this.generator.dailyByTeamsChart(cds, yearMonth, cumulative)
    }
    return await this.generator.dailyBySellersChart(cds, yearMonth, cumulative)
  }

  @Get('resume-chart')
  async getResumeChart (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',', optional: true }))
    cds: number[],
    @Query('cd')
    cd: number,
    @Query('year-month', new IdMesAnoValidationPipe(false))
    yearMonth: string,
    @Query('type')
    type: 'seller' | 'team',
    @Query('init-day')
    initDay: number,
    @Query('end-day')
    endDay: number,
  ) {
    if (!cds && !cd) {
      throw new BadRequestException('\'cd\' or \'cds\' must be specified')
    }
    const dates = (initDay && endDay) ? [new Date(initDay), new Date(endDay)] : null
    if (type === 'team') {
      if (!Number.isNaN(cd)) {
        return this.generator.resumeByTeamChart(cd, yearMonth, dates)
      } else {
        return this.generator.resumeByTeamsChart(cds, yearMonth, dates)
      }
    } else {
      return this.generator.resumeBySellersChart(cds, yearMonth, dates)
    }
  }
}
