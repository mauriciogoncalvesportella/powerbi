/*
 * Queries
 */
export interface IRevenueGoalQueries {
  teamGoal (code: number, yearMonth: string): Promise<RevenueGoalQueryResult> 
  sellerGoal (code: number, yearMonth: string): Promise<RevenueGoalQueryResult>
  resumeGoal (teamCode: number, yearMonth: string): Promise<RevenueGoalQueryResult[]>
}

export interface RevenueGoalQueryResult {
  code: number,
  label: string,
  type: string,
  revenue: number,
  markup: number,
  profit: number
}

/*
 * Generator 
 */
export interface IRevenueGoalGenerator {
  teamGoal (code: number, yearMonth: string): Promise<RevenueGoal>
  sellerGoal (code: number, yearMonth: string): Promise<RevenueGoal>
  resumeGoal (teamCode: number, yearMonth: string): Promise<Map<string, RevenueGoal>>
}

export interface RevenueGoal extends RevenueGoalQueryResult {}
