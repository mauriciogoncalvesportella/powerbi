import {BadRequestException, Controller, Get, Inject, ParseArrayPipe, ParseBoolPipe, ParseIntPipe, Query, UseGuards} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import {UserDeactivatedGuard} from "src/auth/user-status/user-status.guard";
import {IdMesAnoValidationPipe} from "src/shared/id-mes-ano.pipe";
import {DateUtils} from "src/utils/date.utils";
import {IBaseDailyBarsChart, IBaseResumeChart} from "../sales.types";
import {MarkupGenerator} from "./markup.generator";

export interface IMarkupDailyBarsDTO extends IBaseDailyBarsChart {}
export interface IMarkupResumeDTO extends IBaseResumeChart {}
export interface IMarkupGenerator {
  dailyTeamsChart (cds: number[], yearMonth: string, fgSituacao: number, accumulated: boolean): Promise<IMarkupDailyBarsDTO>;
  dailySellerChart (cds: number[], yearMonth: string, fgSituacao: number, accumulated: boolean): Promise<IMarkupDailyBarsDTO>;
  resumeSellerChart (cds: number[], yearMonth: string, fgSituacao: number, dates?: string[]): Promise<IMarkupResumeDTO>;
  resumeTeamChart (cds: number[], yearMonth: string, fgSituacao: number, dates?: string[]): Promise<IMarkupResumeDTO>;
}

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Role('user')
@Controller('/bi/sales/markup')
export class MarkupController {
  constructor (
    @Inject(MarkupGenerator)
    private generator: IMarkupGenerator
  ) {}

  @Get('daily-bars')
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
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',' }))
    cds: number[],
    @Query('yearMonth', new IdMesAnoValidationPipe(false))
    yearMonth: string,
    @Query('type')
    type: 'seller' | 'team',
    @Query('initDay')
    initDay: number,
    @Query('endDay')
    endDay: number
  ) {
    const dates = DateUtils.initEndFormat(initDay, endDay)
    if (type === 'team') {
      return await this.generator.resumeTeamChart(cds, yearMonth, 5, dates)
    } else {
      return await this.generator.resumeSellerChart(cds, yearMonth, 5, dates)
    }
  }
}
