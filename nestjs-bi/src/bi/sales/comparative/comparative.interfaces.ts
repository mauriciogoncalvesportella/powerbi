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
  cost_value: number
}

export interface QueryResultOrdersByMonth {
  year_month: string,
  month: number,
  revenue: number,
  profit_value: number,
  cost_value: number
}

export abstract class ComparativeRepository {
  abstract ordersByMonthExpanded (teamCode: number, yearMonths: string[]): Promise<QueryResultOrdersByMonthExpanded[]>
  abstract ordersByMonth (code: number, type: 'seller' | 'team', yearMonths: string[]): Promise<QueryResultOrdersByMonth[]>
}
