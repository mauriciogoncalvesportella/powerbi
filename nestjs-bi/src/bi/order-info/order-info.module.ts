import {Module} from "@nestjs/common";
import {OrderInfoTypeormService} from "./order-info-typeorm.service";
import {OrderInfoController} from "./order-info.controller";

@Module({
  controllers: [OrderInfoController],
  providers: [OrderInfoTypeormService]
})
export class OrderInfoModule {}
