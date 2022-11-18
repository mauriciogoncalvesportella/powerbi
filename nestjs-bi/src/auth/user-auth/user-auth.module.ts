import {Module} from "@nestjs/common";
import {UserAuthController} from "./user-auth.controller";
import {UserAuthService} from "./user-auth.service";


@Module({
  providers: [UserAuthService],
  exports: [UserAuthService],
  controllers: [UserAuthController],
})
export class UserAuthModule {}
