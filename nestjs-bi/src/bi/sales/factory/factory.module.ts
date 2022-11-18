import {Module} from "@nestjs/common";
import {TeamModule} from "../team/team.module";
import {FactoryController} from "./factory.controller";
import {FactoryGenerator} from "./factory.generator";
import {FactoryQueries} from "./factory.queries";

@Module({
  imports: [TeamModule],
  providers: [
    FactoryQueries,
    FactoryGenerator
  ],
  controllers: [FactoryController]
})
export class FactoryModule {}
