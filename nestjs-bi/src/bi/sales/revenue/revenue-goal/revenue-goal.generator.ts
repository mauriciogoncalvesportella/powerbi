import {Inject, Injectable} from "@nestjs/common";
import {Connection} from "typeorm";
import {RevenueGoalQueries} from "./revenue-goal.queries";
import {IRevenueGoalGenerator, IRevenueGoalQueries, RevenueGoal} from "./revenue-goal.types";

@Injectable()
export class RevenueGoalGenerator implements IRevenueGoalGenerator {
  constructor (
    @Inject('CONNECTION')
    private connection: Connection,
    @Inject(RevenueGoalQueries)
    private queries: IRevenueGoalQueries,
  ) {}

  async teamGoal (code: number, yearMonth: string): Promise<RevenueGoal> {
    return await this.queries.teamGoal(code, yearMonth)
  }

  async sellerGoal (code: number, yearMonth: string): Promise<RevenueGoal> {
    return await this.queries.sellerGoal(code, yearMonth)
  }

  async resumeGoal (teamCode: number, yearMonth: string): Promise<Map<string, RevenueGoal>> {
    const map: Map<string, RevenueGoal> = new Map()
    const queryResult = await this.queries.resumeGoal(teamCode, yearMonth)
    queryResult.forEach(row => map.set(`${row.code}_${row.type}`, row))
    return map
  }
}
