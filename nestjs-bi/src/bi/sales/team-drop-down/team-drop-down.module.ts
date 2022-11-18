import {Module} from "@nestjs/common";
import {TeamDropdownController} from "./team-drop-down.controller";
import {TeamDropdownGenerator} from "./team-drop-down.generator";
import {TeamDropdownQueries} from "./team-drop-down.queries";

@Module({
  controllers: [TeamDropdownController],
  providers: [TeamDropdownGenerator, TeamDropdownQueries]
})
export class TeamDropdownModule {  }
