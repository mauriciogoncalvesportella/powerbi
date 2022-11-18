import {Module} from "@nestjs/common";
import {ComparativeController} from "./comparative.controller";
import {ComparativeGenerator} from "./comparative.generator";
import {ComparativeQueries} from "./comparative.queries";

@Module({
  controllers: [ComparativeController],
  providers: [ComparativeGenerator, ComparativeQueries]
})
export class ComparativeModule {}
