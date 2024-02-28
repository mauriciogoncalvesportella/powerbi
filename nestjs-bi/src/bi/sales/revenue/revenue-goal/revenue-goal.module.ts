import {Module} from "@nestjs/common";
import {RevenueGoalGenerator} from "./revenue-goal.generator";
import {RevenueGoalQueries} from "./revenue-goal.queries";

@Module({
  providers: [RevenueGoalGenerator, RevenueGoalQueries],
  exports: [RevenueGoalGenerator]
})
export class RevenueGoalModule {}
