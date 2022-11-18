import { Module } from "@nestjs/common";
import {MarkupModule} from "./markup/markup.module";
import {ProfitModule} from "./profit_new/profit.module";
import { RevenueModule } from "./revenue/revenue.module";
import { SalesController } from "./sales.controller";
import { SalesRepository } from "./sales.repository";
import { SalesService } from "./sales.service";
import { TeamModule } from "./team/team.module";
import { RevenueModule as RevenueModuleNew } from './revenue_new/revenue.module'
import { RevenueModule as RevenueModuleNew2 } from './revenue_new2/revenue.module'
// import {LinearityModule} from "./linearity/linearity.module";
import {LinearityModule} from "./linearity_new/linearity.module";
import {FactoryModule} from "./factory/factory.module";
import {TeamDropdownModule} from "./team-drop-down/team-drop-down.module";
import {ComparativeModule} from "./comparative/comparative.module";

@Module({
  imports: [
    TeamDropdownModule,
    TeamModule,
    RevenueModule,
    MarkupModule,
    ProfitModule,
    RevenueModuleNew,
    RevenueModuleNew2,
    LinearityModule,
    FactoryModule,
    ComparativeModule
  ],
  providers: [
    SalesService,
    SalesRepository,
  ],
  controllers: [
    SalesController,
  ],
})
export class SalesModule {}
