import {Module} from "@nestjs/common";
import {UserStatusController} from "./user-status.controller";
import {UserStatusQueries} from "./user-status.queries";
import {UserStatusService} from "./user-status.service";

@Module({
  providers: [ UserStatusService, UserStatusQueries ],
  exports: [ UserStatusService ],
  controllers: [ UserStatusController ]
})
export class UserStatusModule {}
