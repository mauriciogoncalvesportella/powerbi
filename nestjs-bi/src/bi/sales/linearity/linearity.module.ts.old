import {Module} from "@nestjs/common";
import {LinearityController} from "./linearity.controller";
import {LinearityGenerator} from "./linearity.generator";
import {LinearityQueries} from "./linearity.queries";

@Module({
  providers: [
    LinearityQueries,
    LinearityGenerator,
  ],
  controllers: [LinearityController]
})
export class LinearityModule {}
