import {BadRequestException, Controller, Get, Inject, Injectable, ParseIntPipe, Query, UseGuards} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import {UserDeactivatedGuard} from "src/auth/user-status/user-status.guard";
import {YearMonthArrayValidationPipe} from "src/shared/year-month-array.pipe";
import { GetOrder } from "./order.types";
import { OrderInfoTypeormService } from './order-info-typeorm.service'
import {DateOrYearMonthParam} from "../sales/sales.types";
import {IdMesAnoValidationPipe} from "src/shared/id-mes-ano.pipe";

export interface IOrderInfoService {
  getOrderList (params: GetOrder.BaseStrategy): Promise<GetOrder.OrderInfo[]>
}

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Controller('/bi/order-info')
export class OrderInfoController {
  constructor (
    @Inject(OrderInfoTypeormService)
    private service: IOrderInfoService
  ) {}
  
  @Get('from-customer')
  async getOrderListFromCustomer (
    @Query('customerCode', new ParseIntPipe())
    customerCode: number,
    @Query('startYearMonth', new YearMonthArrayValidationPipe())
    startYearMonth: string,
    @Query('endYearMonth', new YearMonthArrayValidationPipe())
    endYearMonth: string
  ) {
    const params = new GetOrder.FromCustomerStrategy(customerCode, startYearMonth, endYearMonth)
    return this.service.getOrderList(params)
  }

  @Get('from-seller')
  async getOrderListFromSeller (
    @Query('sellerCode', new ParseIntPipe())
    sellerCode: number,
    @Query('yearMonth', new IdMesAnoValidationPipe(false))
    yearMonth: string,
    @Query('initDay')
    initDay: string,
    @Query('endDay')
    endDay: string
  ) {
    let dateOrYearMonthParam: DateOrYearMonthParam
    if (initDay && endDay) {
      dateOrYearMonthParam = new DateOrYearMonthParam('dates', [initDay, endDay])
    } else if (yearMonth) {
      dateOrYearMonthParam = new DateOrYearMonthParam('yearMonth', yearMonth)
    } else {
      throw new BadRequestException('initDay and endDay, or yearMonth must be specified')
    }

    console.log(dateOrYearMonthParam)

    const params = new GetOrder.FromSellerStrategy(sellerCode, dateOrYearMonthParam)
    return this.service.getOrderList(params)
  }
}
