import {Module} from "@nestjs/common";
import {CustomerModule} from "./customer/customer.module";
import {OrderInfoModule} from "./order-info/order-info.module";
import {SalesModule} from "./sales/sales.module";
import { JwtGuard } from "src/auth/jwt.guard";
import { UserRolesGlobalGuard } from "src/auth/user-roles/user-roles-global.guard";
import { APP_GUARD } from "@nestjs/core";
import { UserDeactivatedGuard } from "src/auth/user-status/user-status.guard";
import { CheckUserRolesGuard } from "src/auth/user-roles/check-user-roles.guard";

@Module({
  imports: [
    SalesModule,
    CustomerModule,
    OrderInfoModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard
    },
    {
      provide: APP_GUARD,
      useClass: UserDeactivatedGuard
    },
    {
      provide: APP_GUARD,
      useClass: UserRolesGlobalGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CheckUserRolesGuard
    }
  ]
})
export class BIModule {}
