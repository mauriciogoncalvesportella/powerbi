import {Controller, Get, Inject, ParseArrayPipe, Query, UseGuards, ParseIntPipe} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {UserDeactivatedGuard} from "src/auth/user-status/user-status.guard";
import {ComparativeGenerator} from 'src/bi/sales/comparative/comparative.generator'
import {IComparativeGenerator} from "./comparative.types";

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Controller('/bi/sales/comparative')
export class ComparativeController {
  constructor (
    @Inject(ComparativeGenerator)
    private generator: IComparativeGenerator
  ) {}

  @Get('revenue')
  async revenue (
    @Query('code', ParseIntPipe) code: number,
    @Query('type') type: 'seller' | 'team',
    @Query('interval', new ParseArrayPipe({ items: String, separator: ',' })) interval: string[]
  ) {
    return await this.generator.comparative(type, code, interval, new ComparativeGenerator.RevenueStrategy())
  }

  @Get('profit')
  async profit(
    @Query('code', ParseIntPipe) code: number,
    @Query('type') type: 'seller' | 'team',
    @Query('interval', new ParseArrayPipe({ items: String, separator: ',' })) interval: string[] 
  ) {
    return await this.generator.comparative(type, code, interval, new ComparativeGenerator.ProfitStrategy())
  }

  @Get('markup')
  async markup (
    @Query('code', ParseIntPipe) code: number,
    @Query('type') type: 'seller' | 'team',
    @Query('interval', new ParseArrayPipe({ items: String, separator: ',' })) interval: string[] 
  ) {
    return await this.generator.comparative(type, code, interval, new ComparativeGenerator.MarkupStrategy())
  }
}
