import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CampaignRepository } from './campaign.repository';
import { DatabaseModule } from '../../database/database.module';


// MÓDULO PRINCIPAL DA APLICAÇÃO
// Module: Agrupa controllers, services e providers relacionados.
// Importa o módulo de banco de dados
// Exporta o service e o repository

@Module({
  imports: [DatabaseModule], // <-- importa o módulo de banco de dados
  providers: [ // provedores
    CampaignService,
    CampaignRepository,
  ],
  controllers: [
    CampaignController
  ],
  exports: [
    CampaignService,
    CampaignRepository,
  ]
})
export class CampaignModule {}