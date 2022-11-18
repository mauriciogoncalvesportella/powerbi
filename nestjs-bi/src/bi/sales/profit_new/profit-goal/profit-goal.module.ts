import {Module} from "@nestjs/common";
import {ProfitGoalGenerator} from "./profit-goal.generator";
import {ProfitGoalQueries} from "./profit-goal.queries";

@Module({
  providers: [ProfitGoalGenerator, ProfitGoalQueries],
  exports: [ProfitGoalGenerator]
})
export class ProfitGoalModule {}
