import { Controller, Get, Inject, Param, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/jwt.guard";
import { CampaignTypeOrmService } from '../campaign/campaign.typeorm.service';
import { UserDeactivatedGuard } from "src/auth/user-status/user-status.guard";

export interface Campaign {
  code: number;
  name: string;
  startDate: Date;
  endDate: Date;
  status: number;
}

export interface ICampaignService {
  getCampaignByCode(code: number): Promise<Campaign>;
}

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Controller('/bi/campaign')
export class CampaignController {
  constructor(
    @Inject(CampaignTypeOrmService)
    private service: ICampaignService
  ) {}

  @Get(':code')
  async getCampaignByCode(@Param() params: any): Promise<Campaign> {
    return await this.service.getCampaignByCode(params.code);
  }
}