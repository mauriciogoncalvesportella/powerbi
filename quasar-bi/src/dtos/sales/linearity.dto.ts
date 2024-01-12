/*
export interface LinearityPerCustomerItem {
  code: number,
  customer: string,
  create_date: string,
  count: number,
  amount: number,
  current: number,
  status: number,
  year_month: string[]
}
export type LinearityPerCustomerDTO = LinearityPerCustomerItem[]
*/
export interface LinearityPerCustomerItem {
  customer_code: number,
  customer_name: string,
  seller_name: string,
  create_date: string,
  count: number,
  status: number,
  new_customer: boolean,
  total_amount: number,
  current_amount: number,
  monthly: Record<string, number>
}

export type LinearityPerCustomerDTO = {
  data: LinearityPerCustomerItem[],
  total: number
}
