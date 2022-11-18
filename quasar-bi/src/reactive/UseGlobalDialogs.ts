import { ref, Ref } from 'vue'

export class GetOrderListBase {
  public strategy!: 'from-seller' | 'from-customer'

  constructor (
    strategy: 'from-seller' | 'from-customer'
  ) {
    this.strategy = strategy
  }
}

export class GetOrderListFromSeller extends GetOrderListBase {
  constructor (
    public sellerCode: number,
    public yearMonth?: string,
    public initDay?: string,
    public endDay?: string
  ) {
    super('from-seller')
  }
}

export class GetOrderListFromCustomer extends GetOrderListBase {
  constructor (
    public customerCode: number,
    public startYearMonth: string,
    public endYearMonth: string
  ) {
    super('from-customer')
  }
}

export const GlobalOrderInfoDialog = {
  param: ref(null) as Ref<GetOrderListBase | null>,
  open: (param: GetOrderListBase) => {
    GlobalOrderInfoDialog.param.value = param
  }
}
