/*
 * Queries
 */
export interface IProfitGoalQueries {
  teamGoal (code: number, yearMonth: string): Promise<ProfitGoalQueryResult> 
  sellerGoal (code: number, yearMonth: string): Promise<ProfitGoalQueryResult>
  resumeGoal (teamCode: number, yearMonth: string): Promise<ProfitGoalQueryResult[]>
}

export interface ProfitGoalQueryResult {
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
export interface IProfitGoalGenerator {
  teamGoal (code: number, yearMonth: string): Promise<ProfitGoal>
  sellerGoal (code: number, yearMonth: string): Promise<ProfitGoal>
  resumeGoal (teamCode: number, yearMonth: string): Promise<Map<string, ProfitGoal>>
}

export interface ProfitGoal extends ProfitGoalQueryResult {}
