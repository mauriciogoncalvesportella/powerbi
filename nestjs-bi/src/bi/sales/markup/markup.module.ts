import {Module} from "@nestjs/common";
import {TeamModule} from "../team/team.module";
import {MarkupRepository} from "./markup.repository";
import {MarkupGenerator} from "./markup.generator";
import {MarkupController} from "./markup.controller";
import {GoalRepository} from "../goal.repository";

@Module({
  imports: [TeamModule],
  providers: [MarkupGenerator, MarkupRepository, GoalRepository],
  controllers: [MarkupController]
})
export class MarkupModule { }
