import {Module} from "@nestjs/common";
import {RevenueGoalModule} from "./revenue-goal/revenue-goal.module";
import {RevenueController} from "./revenue.controller";
import {RevenueGenerator} from "./revenue.generator";
import {RevenueQueries} from "./revenue.queries";

@Module({
  imports: [
    RevenueGoalModule
  ],
  providers: [
    RevenueGenerator,
    RevenueQueries,
  ],
  controllers: [
    RevenueController
  ]
})
export class RevenueModule {}
