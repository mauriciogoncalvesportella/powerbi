/*
Recebe as requisições do frontend e chama o service para
processar as informações e retornar as respostas 
para o frontend
*/

import { Controller, Get, Param, UseGuards, ParseIntPipe } from "@nestjs/common";
import { CampaignService } from './campaign.service'; // <-- import
import { CampaignRevenueDTO, CampaignVendorDTO, CampaignProductDTO, ProductVendorDTO } from "./campaign.repository";
import { CadCampanhaEntity } from "src/database/entity/tenant/cad_campanha.entity";

// @UseGuards(JwtGuard, UserDeactivatedGuard)
// @CheckUserRoles(UserRoles.sales_revenue)
@Controller('/bi/sales/campaign')
export class CampaignController { // --> export
  constructor(
    private readonly campaignService: CampaignService
  ) {}

  /**
   * GET /bi/sales/campaign
   * Retorna todas as campanhas - Gráfico principal de campanhas
   */
  @Get()
  async getAllCampaigns(): Promise<CampaignRevenueDTO[]> {
    try {
      const campaigns = await this.campaignService.getAllCampaigns();
      return campaigns;
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /bi/campaign/:campaignId
   * Retorna uma campanha específica por ID
   */
  @Get(':campaignId') // id da campanha que quer buscar
  async getCampaignById(@Param('campaignId', ParseIntPipe) campaignId: number): Promise<CadCampanhaEntity | undefined> {
    try {
      const campaign = await this.campaignService.getCampaignById(campaignId);
      return campaign;
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /bi/campaign/:campaignId/vendors
   * Retorna TODOS os vendedores ativos - para o segundo gráfico
   * Aqui todos os vendedores ativos aparecerão, com revenue 0 para quem não participa da campanha
   */
  @Get(':campaignId/vendors')
  async getCampaignVendors(@Param('campaignId', ParseIntPipe) campaignId: number): Promise<CampaignVendorDTO[]> {
    try {
      const vendors = await this.campaignService.getVendorsByCampaign(campaignId);
      return vendors;
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /bi/campaign/:campaignId/products
   * Retorna produtos da campanha com detalhes por vendedor
   * Formato: CodigoProduto, NomeProduto, QuantidadeProduto, CodigoVendedor, NomeVendedor
   */
  @Get(':campaignId/products')
  async getCampaignProducts(@Param('campaignId', ParseIntPipe) campaignId: number): Promise<CampaignProductDTO[]> {
    try {
      const products = await this.campaignService.getCampaignProducts(campaignId);
      return products;
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /bi/campaign/:campaignId/products/:productId/vendors
   * Retorna vendedores de um produto específico - para o quarto gráfico
   * Mostra faturamento e meta de cada vendedor para aquele produto
   */
  @Get(':campaignId/products/:productId/vendors')
  async getProductVendors(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('productId', ParseIntPipe) productId: number
  ): Promise<ProductVendorDTO[]> {
    try {
      const vendors = await this.campaignService.getProductVendors(campaignId, productId);
      return vendors;
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /bi/sales/campaign/:campaignId/vendor/:vendorId/products
   * Retorna produtos vendidos e meta por produto para um vendedor na campanha
   */
  @Get(':campaignId/vendor/:vendorId/products')
  async getVendorProducts(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('vendorId', ParseIntPipe) vendorId: number
  ): Promise<any[]> {
    return this.campaignService.getVendorProductsByCampaign(campaignId, vendorId);
  }
}