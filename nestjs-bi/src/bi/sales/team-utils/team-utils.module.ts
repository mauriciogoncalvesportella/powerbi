import { Module } from "@nestjs/common";
import { TeamUtilsService } from "./team-utils.service";
import { TeamUtilsRepository } from "./team-utils.interfaces";
import { TeamUtilsQueries } from "./team-utils.queries";

@Module({
  providers: [TeamUtilsService, { provide: TeamUtilsRepository, useClass: TeamUtilsQueries }],
  exports: [TeamUtilsService]
})
export class TeamUtilsModule { }