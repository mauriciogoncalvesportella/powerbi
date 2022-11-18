import {Controller, Get, Inject, Param, UseGuards} from "@nestjs/common";
import {JwtGuard} from "src/auth/jwt.guard";
import { CustomerTypeOrmService } from './customer-typeorm.service'
import {UserDeactivatedGuard} from "src/auth/user-status/user-status.guard";

export interface Customer {
  code: number
  customerId: string
  cnpjOrCpfCode: string
  companyName: string
  tradingName: string
  sellerCode: number
  districtName: string
  cityName: string
  stateName: string
  phoneId: string
  phone2Id: string
  mobilePhoneId: string
  creditLimitValue: number
  discontValue: number
  status: number
}

export interface ICustomerService {
  getCustomerByCode (code: number): Promise<Customer>
}

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Controller('/bi/customer')
export class CustomerController {
  constructor (
    @Inject(CustomerTypeOrmService)
    private service: ICustomerService
  ) {}

  @Get(':code')
  async getCustomerByCode (@Param() params: any): Promise<Customer> {
    return await this.service.getCustomerByCode(params.code)
  }
}
