import {DateOrYearMonthParam} from "../sales/sales.types"

export namespace GetOrder {
  export enum Strategies {
    FromCustomer,
    FromSeller
  }

  export abstract class BaseStrategy {
    constructor(
      public type: Strategies
    ) {}
  }

  export class FromCustomerStrategy extends BaseStrategy {
    constructor(
      public customerCode: number,
      public startYearMonth: string,
      public endYearMonth: string
    ) {
      super(Strategies.FromCustomer)
    }
  }

  export class FromSellerStrategy extends BaseStrategy {
    constructor(
      public sellerCode: number,
      public param: DateOrYearMonthParam
    ) {
      super(Strategies.FromSeller)
    }
  }

  export interface OrderInfo {
    code: number,
    yearMonth: string,
    orderId: string,
    tabletId: string,
    invoiceId: string,
    status: number,
    shippingType: number,
    seller: {
      code: number,
      name: string,
      teamCode: number,
      teamName: string
    },
    orderType: {
      code: number,
      name: string
    },
    customer: {
      code: number,
      name: string,
      tradingName: string
    },
    paymentTerms: {
      code: number,
      name: string,
      average: number,
      installments: number
    },
    company: {
      code: number,
      name: string,
      tradingName: string
    },
    values: {
      products: number,
      disconts: number,
      icmsTax: number,
      ipiTax: number,
      shipping: number,
      comission: number,
      comissionPercentual: number,
      cost: number,
      profit: number,
      markupPercentual: number,
      profitPercentual: number
    },
    dates: {
      issue: string,
      delivery: string
    },
    productResume: {
      code: number,
      id: string,
      name: string,
      quantity: number,
      total: number
    }[]
  }
}
