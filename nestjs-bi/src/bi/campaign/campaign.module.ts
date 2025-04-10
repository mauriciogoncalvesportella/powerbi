import { Module } from "@nestjs/common";
import { CampaignTypeOrmService } from "../campaign/campaign.typeorm.service";
import { CampaignController } from "../campaign/campaign.controller";

@Module({
  controllers: [CampaignController],
  providers: [CampaignTypeOrmService]
})
export class CampaignModule {}