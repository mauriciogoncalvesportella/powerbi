import { Module } from "@nestjs/common";
import { TeamUtilsModule } from "../team-utils/team-utils.module";
import { ComparativeQueries } from "./comparative.queries";
import { GetYearMonthsService } from "./get-year-months/get-year-months.service";
import { ComparativeController } from "./comparative.controller";
import { ComparativeUseCases } from "./comparative.use-cases";
import { ComparativeRepository } from "./comparative.interfaces";
import { PeriodsUseCase } from "./use-cases/periods.use-case";
import { PreviousUseCase } from "./use-cases/previous.use-case";
import { PreviousExpandUseCase } from "./use-cases/previous-expand.use-case";

@Module({
  imports: [TeamUtilsModule],
  providers: [
    { provide: ComparativeRepository, useClass: ComparativeQueries },
    GetYearMonthsService,
    ComparativeUseCases,
    PeriodsUseCase,
    PreviousUseCase,
    PreviousExpandUseCase
  ],
  controllers: [ComparativeController]
})
export class ComparativeModule {}