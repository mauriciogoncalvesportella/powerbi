// src/bi/campaign/campaign.controller.ts
import { Controller, Get, Param, Query, UseGuards, Post, Body, Put, Delete } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserDeactivatedGuard } from 'src/auth/user-status/user-status.guard';
import { CampaignTypeOrmService } from './campaign.typeorm.service';

@UseGuards(JwtGuard, UserDeactivatedGuard)
@Controller(['bi/campaign'])
export class CampaignController {
  constructor(private campaignService: CampaignTypeOrmService) {}

  // Buscar lista de campanhas com dados para o gráfico principal
  @Get()
  async getCampaignList(): Promise<any[]> {
    return await this.campaignService.getAllCampaigns();
  }

  // Buscar dados de faturamento mensal por equipe
  @Get('team-revenue')
  async getTeamMonthlyRevenue(): Promise<any[]> {
    return await this.campaignService.getTeamMonthlyRevenue();
  }

  // Buscar desempenho de vendedores por equipe
  @Get('team/:teamId/sellers')
  async getTeamSellers(@Param('teamId') teamId: number): Promise<any[]> {
    return await this.campaignService.getSellerMonthlyPerformance(teamId);
  }

  // Buscar campanha específica por código
  @Get(':code')
  async getCampaignByCode(@Param('code') code: number): Promise<any> {
    return await this.campaignService.getCampaignByCode(code);
  }

  // Buscar produtos de uma campanha
  @Get(':code/products')
  async getCampaignProducts(@Param('code') code: number): Promise<any[]> {
    return await this.campaignService.getCampaignProducts(code);
  }

  // Buscar vendedores de uma campanha com desempenho
  @Get(':campaignId/vendors')
  async getCampaignVendors(@Param('campaignId') campaignId: number): Promise<any[]> {
    return await this.campaignService.getCampaignSalesByVendor(campaignId);
  }

  // Buscar vendedores por produto específico
  @Get(':campaignId/products/:productId/vendors')
  async getProductVendors(
    @Param('campaignId') campaignId: number,
    @Param('productId') productId: number
  ): Promise<any[]> {
    return await this.campaignService.getProductVendorPerformance(campaignId, productId);
  }

  // Criar nova campanha
  @Post()
  async createCampaign(@Body() campaignData: any): Promise<any> {
    return await this.campaignService.createCampaign(campaignData);
  }

  // Atualizar campanha existente
  @Put(':code')
  async updateCampaign(@Param('code') code: number, @Body() campaignData: any): Promise<any> {
    // Você precisará implementar este método no CampaignTypeOrmService
    return { message: "Funcionalidade a ser implementada" };
  }

  // Excluir campanha
  @Delete(':code')
  async deleteCampaign(@Param('code') code: number): Promise<any> {
    // Você precisará implementar este método no CampaignTypeOrmService
    return { message: "Funcionalidade a ser implementada" };
  }

  // Adicionar produto a uma campanha
  @Post(':campaignId/products')
  async addCampaignProduct(
    @Param('campaignId') campaignId: number, 
    @Body() productData: any
  ): Promise<any> {
    // Você precisará implementar este método no CampaignTypeOrmService
    return { message: "Funcionalidade a ser implementada" };
  }

  // Remover produto de uma campanha
  @Delete(':campaignId/products/:productId')
  async removeCampaignProduct(
    @Param('campaignId') campaignId: number,
    @Param('productId') productId: number
  ): Promise<any> {
    // Você precisará implementar este método no CampaignTypeOrmService
    return { message: "Funcionalidade a ser implementada" };
  }

  // Adicionar vendedor a uma campanha
  @Post('vendors')
  async addCampaignVendor(@Body() vendorData: any): Promise<any> {
    return { message: "Funcionalidade a ser implementada" };
  }

  // Remover vendedor de uma campanha
  @Delete('vendors/:id')
  async removeCampaignVendor(@Param('id') id: number): Promise<any> {
    // Você precisará implementar este método no CampaignTypeOrmService
    return { message: "Funcionalidade a ser implementada" };
  }
}