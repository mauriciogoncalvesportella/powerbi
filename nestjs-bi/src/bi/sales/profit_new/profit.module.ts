import {Module} from "@nestjs/common";
import {ProfitGoalModule} from "./profit-goal/profit-goal.module";
import {ProfitController} from "./profit.controller";
import {ProfitGenerator} from "./profit.generator";
import {ProfitQueries} from "./profit.queries";

@Module({
  imports: [
    ProfitGoalModule
  ],
  providers: [
    ProfitGenerator,
    ProfitQueries,
  ],
  controllers: [
    ProfitController
  ]
})
export class ProfitModule {}
