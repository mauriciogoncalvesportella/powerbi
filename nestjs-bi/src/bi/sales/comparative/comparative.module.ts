import { Module } from "@nestjs/common";
import { TeamUtilsModule } from "../team-utils/team-utils.module";
import { ComparativeQueries } from "./comparative.queries";
import { GetYearMonthsService } from "./get-year-months/get-year-months.service";
import { ComparativeController } from "./comparative.controller";
import { ComparativeRepository } from "./comparative.interfaces";
import { YearlyUseCase } from "./use-cases/yearly.use-case";
import { PreviousUseCase } from "./use-cases/previous.use-case";
import { PreviousExpandUseCase } from "./use-cases/previous-expand.use-case";
import { PreviousExpandProductsUseCase } from "./use-cases/previous-expand-products.use-case";

@Module({
  imports: [TeamUtilsModule],
  providers: [
    { provide: ComparativeRepository, useClass: ComparativeQueries },
    GetYearMonthsService,
    YearlyUseCase,
    PreviousUseCase,
    PreviousExpandUseCase,
    PreviousExpandProductsUseCase
  ],
  controllers: [ComparativeController]
})
export class ComparativeModule {}