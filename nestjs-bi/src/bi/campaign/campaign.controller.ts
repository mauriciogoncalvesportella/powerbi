import { Controller, Get, Param, Query, UseGuards, Post, Body, Put, Delete } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserDeactivatedGuard } from 'src/auth/user-status/user-status.guard';
import { CampaignTypeOrmService } from './campaign.typeorm.service';

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Controller(['bi/campaign'])
export class CampaignController {
  constructor(private campaignService: CampaignTypeOrmService) {}

  @Get(':code')
  async getCampaignByCode(@Param('code') code: number): Promise<any> {
    return await this.campaignService.getCampaignByCode(code);
  }

  @Get()
  async getCampaignList(
  ): Promise<any[]> {

    const campaign1 = {
      "name": "Santo Antonio",
      "meta": 98000,
      "faturamento": 95000
    }

    const campaign2 = {
      "name": "Outra Empresa",
      "meta": 98000,
      "faturamento": 95000
    }


    return [campaign1, campaign2];
  }

  @Get(':code/products')
  async getCampaignProducts(@Param('code') code: number): Promise<any[]> {
    return await this.campaignService.getCampaignProducts(code);
  }

  // Adicionando endpoints para corresponder às outras funcionalidades do frontend
  @Post()
  async createCampaign(@Body() campaignData: any): Promise<any> {
    // Você precisará implementar este método no CampaignTypeOrmService
    return { message: "Funcionalidade a ser implementada" };
  }

  @Put(':code')
  async updateCampaign(@Param('code') code: number, @Body() campaignData: any): Promise<any> {
    // Você precisará implementar este método no CampaignTypeOrmService
    return { message: "Funcionalidade a ser implementada" };
  }

  @Delete(':code')
  async deleteCampaign(@Param('code') code: number): Promise<any> {
    // Você precisará implementar este método no CampaignTypeOrmService
    return { message: "Funcionalidade a ser implementada" };
  }

  @Post(':campaignId/products')
  async addCampaignProduct(
    @Param('campaignId') campaignId: number, 
    @Body() productData: any
  ): Promise<any> {
    // Você precisará implementar este método no CampaignTypeOrmService
    return { message: "Funcionalidade a ser implementada" };
  }

  @Delete(':campaignId/products/:productId')
  async removeCampaignProduct(
    @Param('campaignId') campaignId: number,
    @Param('productId') productId: number
  ): Promise<any> {
    // Você precisará implementar este método no CampaignTypeOrmService
    return { message: "Funcionalidade a ser implementada" };
  }

  @Get(':campaignId/vendors')
  async getCampaignVendors(@Param('campaignId') campaignId: number): Promise<any[]> {
    // Você precisará implementar este método no CampaignTypeOrmService
    return [];
  }

  @Get(':campaignId/products/:productId/vendors')
  async getProductVendors(
    @Param('campaignId') campaignId: number,
    @Param('productId') productId: number
  ): Promise<any[]> {
    return [];
  }

  @Post('vendors')
  async addCampaignVendor(@Body() vendorData: any): Promise<any> {
    return { message: "Funcionalidade a ser implementada" };
  }

  @Delete('vendors/:id')
  async removeCampaignVendor(@Param('id') id: number): Promise<any> {
    // Você precisará implementar este método no CampaignTypeOrmService
    return { message: "Funcionalidade a ser implementada" };
  }
}