import {Module} from "@nestjs/common";
import {TeamModule} from "../team/team.module";
import {RevenueDailyService} from "./revenue-daily.service";
import {RevenueMonthlyService} from "./revenue-monthly.service";
import {RevenueComparativeService} from "./revenue-comparative.service";
import {RevenueController} from "./revenue.controller";
import {RevenueRepository} from "./revenue.repository";
import { RevenueService } from './revenue.service'

@Module({
  imports: [TeamModule],
  providers: [
    RevenueComparativeService,
    RevenueService,
    RevenueDailyService,
    RevenueRepository,
    RevenueMonthlyService
  ],
  controllers: [RevenueController],
})
export class RevenueModule {}
