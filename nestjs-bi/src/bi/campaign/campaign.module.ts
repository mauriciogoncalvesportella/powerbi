// src/bi/campaign/campaign.module.ts
import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignTypeOrmService } from './campaign.typeorm.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CampaignController],
  providers: [CampaignTypeOrmService],
  exports: [CampaignTypeOrmService]
})
export class CampaignModule {}