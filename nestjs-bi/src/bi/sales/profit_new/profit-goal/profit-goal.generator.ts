import {Inject, Injectable} from "@nestjs/common";
import {Connection} from "typeorm";
import {ProfitGoalQueries} from "./profit-goal.queries";
import {IProfitGoalGenerator, IProfitGoalQueries, ProfitGoal} from "./profit-goal.types";

@Injectable()
export class ProfitGoalGenerator implements IProfitGoalGenerator {
  constructor (
    @Inject('CONNECTION')
    private connection: Connection,
    @Inject(ProfitGoalQueries)
    private queries: IProfitGoalQueries,
  ) {}

  async teamGoal (code: number, yearMonth: string): Promise<ProfitGoal> {
    return await this.queries.teamGoal(code, yearMonth)
  }

  async sellerGoal (code: number, yearMonth: string): Promise<ProfitGoal> {
    return await this.queries.sellerGoal(code, yearMonth)
  }

  async resumeGoal (teamCode: number, yearMonth: string): Promise<Map<string, ProfitGoal>> {
    const map: Map<string, ProfitGoal> = new Map()
    const queryResult = await this.queries.resumeGoal(teamCode, yearMonth)
    queryResult.forEach(row => map.set(`${row.code}_${row.type}`, row))
    return map
  }
}
