/*
 * Queries
*/
export interface QueryResultOrdersByMonthExpanded {
  team_code: number,
  team_id: string,
  seller_code: number,
  year_month: string,
  month: number,
  revenue: number,
  profit_value: number,
  cost_value: number,
  products_count: number
}

export interface QueryResultOrdersByMonthExpandedProducts {
  product_code: number,
  product_label: string,
  year_month: string,
  month: number,
  revenue: number,
  profit_value: number,
  cost_value: number,
  products_count: number
}

export interface QueryResultOrdersByMonth {
  year_month: string,
  month: number,
  revenue: number,
  profit_value: number,
  cost_value: number,
  products_count: number
}

export abstract class ComparativeRepository {
  abstract ordersByMonthExpanded (code: number, type: 'seller' | 'team', yearMonths: string[], productCode?: number | null): Promise<QueryResultOrdersByMonthExpanded[]>
  abstract ordersByMonth (code: number, type: 'seller' | 'team', yearMonths: string[], productCode?: number | null): Promise<QueryResultOrdersByMonth[]>
  abstract ordersByMonthExpandedProducts (code: number, type: 'seller' | 'team', yearMonths: string[], productCode?: number | null): Promise<QueryResultOrdersByMonthExpandedProducts[]>
}
