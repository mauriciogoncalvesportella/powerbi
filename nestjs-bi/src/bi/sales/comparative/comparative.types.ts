export interface QueryResultComparative {
  status: 'billed' | 'not_billed',
  year_month: string,
  code: number,
  type: 'seller' | 'team',
  label: string,
  market_value: number,
  cost_value: number,
  profit_value: number
}

export interface ComparativeSerieDTO {
  code: number,
  type: string,
  label: string,
  values: number[]
}

export interface ComparativeDTO {
  categories: string[],
  series: ComparativeSerieDTO[]
}

export const createComparativeSerie = (code: number, type: 'seller'|'team', label: string) => ({
  code,
  label,
  type,
  values: []
})

export interface IComparativeQueries {
  comparativeTeam (teamCode: number, interval: string[]): Promise<QueryResultComparative[]>
  comparativeSeller (sellerCode: number, interval: string[]): Promise<QueryResultComparative[]>
}

export interface IComparativeGenerator {
  comparative(type: 'seller' | 'team', code: number, interval: string[], strategy: IComparativeStrategy): Promise<ComparativeDTO>
}

export interface IComparativeStrategyObject {
  market_value: number,
  cost_value: number,
  profit_value: number
}

export interface IComparativeStrategy {
  execute (row: IComparativeStrategyObject): number
}
