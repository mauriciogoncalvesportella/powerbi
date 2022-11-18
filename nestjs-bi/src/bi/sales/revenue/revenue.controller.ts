import {BadRequestException, Controller, Get, ParseArrayPipe, ParseIntPipe, Query, UseGuards} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {Role} from "src/auth/role.decorator";
import {SupervisorGuard} from "src/auth/supervisor.guard";
import {IdMesAnoValidationPipe} from "src/shared/id-mes-ano.pipe";
import {TeamService} from "../team/team.service";
import {RevenueDailyService} from "./revenue-daily.service";
import {RevenueMonthlyService} from "./revenue-monthly.service";
import {RevenueComparativeService} from "./revenue-comparative.service";
import {RevenueService} from "./revenue.service";
import {RevenueMonthlyDTO} from "./revenue.types";
import {YearMonthArrayValidationPipe} from "src/shared/year-month-array.pipe";
import {formatToTimeZone} from "date-fns-timezone";
import {UserDeactivatedGuard} from "src/auth/user-status/user-status.guard";

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Role('user')
@Controller('/bi/sales/faturamento')
export class RevenueController {
  constructor (
    private dailyService: RevenueDailyService,
    private monthlyService: RevenueMonthlyService,
    private teamService: TeamService,
    private revenueService: RevenueService,
    private revenueComparativeService: RevenueComparativeService
  ) {}

  @Get('comparativo')
  async comparative (
    @Query('sellersCode', new ParseArrayPipe({ items: Number, optional: true }))
    sellersCode: number[],
    @Query('teamsCode', new ParseArrayPipe({ items: Number, optional: true }))
    teamsCode: number[],
    @Query('count', new ParseIntPipe())
    count: number,
    @Query('yearMonth', IdMesAnoValidationPipe)
    yearMonth: string,
    @Query('accumulated')
    accumulated: boolean
  ) {
    /*
    if (count > 3) {
      throw new BadRequestException('Count cannot be greater than 3')
    }
    */

    if (sellersCode === undefined && teamsCode === undefined) {
      throw new BadRequestException(`'sellersCode' and 'teamsCode' are 'undefined'`)
    }
   
    if (teamsCode) {
      ({ cds: sellersCode } = await this.teamService.sellersFromTeams(...teamsCode))
    } else {
      await this.teamService.sellers(...sellersCode)
    }

    return this.revenueComparativeService.daily(sellersCode, yearMonth, count, accumulated)
  }

  /*
   * Team Realted
  */
  @UseGuards(SupervisorGuard)
  @Get('times')
  async getRevenueFromTeam (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',' }))
    cds: number[],
    @Query('yearMonthArray', new ParseArrayPipe({ items: String, separator: ',' }), YearMonthArrayValidationPipe )
    yearMonthArray: string[]
  ) {
    return await this.revenueService.getRevenueFromTeams(cds, yearMonthArray)
  }

  @UseGuards(SupervisorGuard)
  @Get('diario')
  async get (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',' }))
    cds: number[],
    @Query('idMesAno', IdMesAnoValidationPipe)
    idMesAno: string
  ) {
    return await this.dailyService.fromTeam(cds, idMesAno)
  }

  @UseGuards(SupervisorGuard)
  @Get('diario/acumulado')
  async accumulated (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',' }))
    cds: number[],
    @Query('idMesAno', IdMesAnoValidationPipe)
    idMesAno: string
  ) {
    return await this.dailyService.fromTeamAccumulated(cds, idMesAno)
  }

  @UseGuards(SupervisorGuard)
  @Get('mensal')
  async getMonthly (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',', optional: true }))
    cds: number[],
    @Query('teamCode')
    teamCode: number,
    @Query('idMesAno', IdMesAnoValidationPipe)
    idMesAno: string,
    @Query('initDay')
    initDay: number,
    @Query('endDay')
    endDay: number,
  ): Promise<RevenueMonthlyDTO> {

    if (teamCode == undefined && cds == undefined) {
      throw new BadRequestException('\'cdTeam\' and \'cd\' params null')
    }

    let dates: string[] = null
    if (initDay && endDay) {
      const initDate = formatToTimeZone(initDay, 'YYYY-MM-DD HH:mm', { timeZone: 'America/Sao_Paulo' })
      const endDate = formatToTimeZone(endDay, 'YYYY-MM-DD HH:mm', { timeZone: 'America/Sao_Paulo' })
      // const initDate = `${idMesAno}-${initDay} 00:00:00`
      // const endDate = `${idMesAno}-${endDay} 23:59:59`
      dates = [initDate, endDate]
    }

    if (cds?.length > 0) {
      return await this.monthlyService.fromTeams(cds, idMesAno, dates)
    }

    const teams = (await this.teamService.teamsFromNonLeafTeams([teamCode]))
      .map(it => it.cd)

    const sellers = (await this.teamService.sellersFromLeafTeams([teamCode]))
      .map(it => it.cd)

    const sellersRevenue = await this.monthlyService.fromSellers(sellers, idMesAno, dates)
    const teamsRevenue = await this.monthlyService.fromTeams(teams, idMesAno, dates)

    sellersRevenue.values.push(...teamsRevenue.values)
    sellersRevenue.goalValues.push(...teamsRevenue.goalValues)
    sellersRevenue.cds.push(...teamsRevenue.cds)
    sellersRevenue.types.push(...teamsRevenue.types)
    sellersRevenue.labels.push(...teamsRevenue.labels)

    return sellersRevenue
  }

  /*
   * Seller Related
  */
  @Get('vendedores')
  async getRevenueFromSellers (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',' }))
    cds: number[],
    @Query('yearMonthArray', new ParseArrayPipe({ items: String, separator: ',' }), YearMonthArrayValidationPipe )
    yearMonthArray: string[]
  ) {
    return await this.revenueService.getRevenueFromSellers(cds, yearMonthArray)
  }

  @Get('diario-vendedor')
  async dailyBySeller (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',' }))
    cds: number[],
    @Query('idMesAno', IdMesAnoValidationPipe)
    idMesAno: string
  ) {
    return await this.dailyService.fromSellers(cds, idMesAno)
  }

  @Get('diario-vendedor/acumulado')
  async accumulatedBySeller (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',' }))
    cds: number[],
    @Query('idMesAno', IdMesAnoValidationPipe)
    idMesAno: string
  ) {
    return await this.dailyService.fromSellersAccumulated(cds, idMesAno)
  }

  @Get('mensal-vendedor')
  async monhtlyBySeller (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',', optional: true }))
    cds: number[],
    @Query('teamCode')
    teamCode: number,
    @Query('idMesAno', IdMesAnoValidationPipe)
    idMesAno: string,
    @Query('initDay')
    initDay: number,
    @Query('endDay')
    endDay: number,
  ) {
    if (teamCode == undefined && cds == undefined) {
      throw new BadRequestException('\'cdTeam\' and \'cd\' params null')
    }

    let dates: string[] = null
    if (initDay && endDay) {
      const initDate = formatToTimeZone(initDay, 'YYYY-MM-DD HH:mm', { timeZone: 'America/Sao_Paulo' })
      const endDate = formatToTimeZone(endDay, 'YYYY-MM-DD HH:mm', { timeZone: 'America/Sao_Paulo' })
      // const initDate = `${idMesAno}-${initDay} 00:00:00`
      // const endDate = `${idMesAno}-${endDay} 23:59:59`
      dates = [initDate, endDate]
    }

    if (cds?.length > 0) {
      return await this.monthlyService.fromSellers(cds, idMesAno, dates)
    }

    const sellers = (await this.teamService.sellersFromLeafTeams([teamCode])).map(seller => seller.cd)
    return await this.monthlyService.fromSellers(sellers, idMesAno, dates)
  }
}
