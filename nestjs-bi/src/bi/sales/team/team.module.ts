import {Module} from "@nestjs/common";
import {SellerService} from "./seller.service";
import {TeamController} from "./team.controller";
import {TeamService} from "./team.service";

@Module({
  providers: [TeamService, SellerService],
  controllers: [TeamController],
  exports: [TeamService, SellerService],
})
export class TeamModule {}
