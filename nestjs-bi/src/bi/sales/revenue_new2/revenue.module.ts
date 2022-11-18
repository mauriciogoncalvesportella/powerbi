import {Module} from "@nestjs/common";
import {GoalService} from "../goal.service";
import {RevenueQueries} from "./revenue.queries";
import {TeamModule} from "../team/team.module";
import {RevenueController} from "./revenue.controller";
import {RevenueGenerator} from "./revenue.generator";
import {RevenueGoals} from "./revenue.goals";

@Module({
  imports: [TeamModule],
  providers: [
    RevenueGenerator,
    RevenueGoals,
    GoalService,
    RevenueQueries,
  ],
  controllers: [RevenueController]
})
export class RevenueModule {  }
