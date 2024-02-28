import { Module } from "@nestjs/common";
import { RevenueModule } from "./revenue/revenue.module";
import { SalesController } from "./sales.controller";
import { SalesRepository } from "./sales.repository";
import { SalesService } from "./sales.service";
import { TeamModule } from "./team/team.module";
import { LinearityModule } from "./linearity/linearity.module";
import { FactoryModule } from "./factory/factory.module";
import { TeamDropdownModule } from "./team-drop-down/team-drop-down.module";
import { ComparativeModule } from "./comparative/comparative.module";

@Module({
  imports: [
    TeamDropdownModule,
    TeamModule,
    RevenueModule,
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
