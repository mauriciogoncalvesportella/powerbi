import {Module} from "@nestjs/common";
import {CustomerTypeOrmService} from "./customer-typeorm.service";
import {CustomerController} from "./customer.controller";

@Module({
  controllers: [CustomerController],
  providers: [CustomerTypeOrmService]
})
export class CustomerModule {}
