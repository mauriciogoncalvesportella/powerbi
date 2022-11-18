import {Controller, Get, ParseArrayPipe, ParseIntPipe, Query, UseGuards, UseInterceptors} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {UserDeactivatedGuard} from "src/auth/user-status/user-status.guard";
import {UnitOfWorkInterceptor} from "src/database/unit-of-work/uow.interceptor";
import {DateValidationPipe} from "src/shared/date.pipe";
import {YearMonthArrayValidationPipe} from "src/shared/year-month-array.pipe";
import {SalesService} from "./sales.service";

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Controller('/bi/sales')
export class SalesController {
  constructor (
    private salesService: SalesService,
  ) {}

  @Get('pedidos-vendedor')
  async getOrdersFromSellers (
    @Query('cds', new ParseArrayPipe({ items: Number, separator: ',' }))
    cds: number[],
    @Query('init')
    init: string,
    @Query('end')
    end: string,
    @Query('yearMonth')
    yearMonth: string,
  ) {
    if (!init || !end) {
      return await this.salesService.getOrdersFromSellersYearMonth(cds, yearMonth)
    }
    return await this.salesService.getOrdersFromSellers(cds, init, end)
  }

  @Get('pedido-produtos')
  async getOrderProducts (
    @Query('cdOrder', ParseIntPipe)
    cdOrder: number
  ) {
    return await this.salesService.getOrderProducts(cdOrder)
  }
}
