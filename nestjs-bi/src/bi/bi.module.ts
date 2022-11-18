import {Module} from "@nestjs/common";
import {CustomerModule} from "./customer/customer.module";
import {OrderInfoModule} from "./order-info/order-info.module";
import {SalesModule} from "./sales/sales.module";

@Module({
  imports: [
    SalesModule,
    CustomerModule,
    OrderInfoModule
  ]
})
export class BIModule {}
