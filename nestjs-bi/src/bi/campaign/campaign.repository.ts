import { Injectable, Inject } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { CadCampanhaEntity } from "src/database/entity/tenant/cad_campanha.entity";
import { MultitenantConnection } from 'src/database/multitenant-connection';

// REPOSITORY PRINCIPAL DA APLICAÇÃO
// Responsável por buscar os dados do banco de dados

export interface CampaignRevenueDTO { // receitas da campanha
  campaignCode: number;
  campaignName: string;
  target: number;
  revenue: number;
  teamId: number;
  qtDiasRef?: number;
  vlPercRef?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface CampaignVendorDTO { // vendedores da campanha
  vendorId: number;
  vendorName: string;
  email: string;
  teamId: number;
  goal: number;
  revenue: number;
}

export interface CampaignProductDTO { // produtos da campanha
  productCode: number;
  productName: string;
  quantity: number;
  vendorCode: number;
  vendorName: string;
}

export interface ProductVendorDTO { // vendedores de produtos
  vendorId: number;
  vendorName: string;
  sales: number;
  goal: number;
  revenue: number;
}

@Injectable()
export class CampaignRepository {
  private manager: EntityManager;

  constructor(
    @Inject(MultitenantConnection)
    private readonly multitenantConnection: MultitenantConnection,
  ) {
    this.manager = this.multitenantConnection.manager;
  }

  async getCampaigns(): Promise<CampaignRevenueDTO[]> {
    try {
      
      const rawData: any[] = await this.manager.query(`
        SELECT 
          c.cd as "campaignCode",
          c."nmCampanha" as "campaignName", 
          c."vlCampanha" as "target",
          c."cdvendedor" as "teamId",
          c."dtInicio" as "startDate",
          c."dtFinal" as "endDate",
          c."qtDiasRef" as "qtDiasRef",
          c."vlPercRef" as "vlPercRef",
          COALESCE(SUM(cv."vlMetafat"), 0) as "revenue"
        FROM ten_candy.cad_campanha c
        LEFT JOIN ten_candy.cad_campanha_vendedor cv ON cv."cdCampanha" = c.cd
          AND cv."fgAtivo" = true
        WHERE c."fgAtivo" = 1
        GROUP BY c.cd, c."nmCampanha", c."vlCampanha", c."cdvendedor", 
                 c."dtInicio", c."dtFinal", c."qtDiasRef", c."vlPercRef"
        ORDER BY c.cd
      `);

      const campaigns: CampaignRevenueDTO[] = rawData.map(data => ({
        campaignCode: parseInt(data.campaignCode),
        campaignName: data.campaignName,
        target: parseFloat(data.target) || 0,
        revenue: parseFloat(data.revenue) || 0,
        teamId: parseInt(data.teamId) || 1,
        qtDiasRef: parseInt(data.qtDiasRef) || 0,
        vlPercRef: parseFloat(data.vlPercRef) || 0,
        startDate: data.startDate,
        endDate: data.endDate,
      }));

      return campaigns;
    } catch (error) {
      throw error;
    }
  }

  async getProductsByCampaign(campaignId: number): Promise<CampaignProductDTO[]> { // produtos da campanha
    try {
      const rawData: any[] = await this.manager.query(`
        SELECT 
          p.cd as "productCode",
          CONCAT(p."idProduto", ' - ', p."nmProduto") as "productName",
          COALESCE(SUM(cv."qtProduto"), 0) as "quantity",
          COALESCE(p."vlVenda", 0) as "unitValue",
          COALESCE(SUM(cv."qtProduto" * p."vlVenda"), 0) as "totalValue"
        FROM ten_candy.cad_produto p
        INNER JOIN ten_candy.cad_campanha_vendedor cv ON cv."cdProduto" = p.cd
        WHERE cv."cdCampanha" = $1
          AND cv."fgAtivo" = true
          AND cv."cdProduto" IS NOT NULL
        GROUP BY p.cd, p."idProduto", p."nmProduto", p."vlVenda"
        ORDER BY p."idProduto"
      `, [campaignId]);

      return rawData.map(data => ({
        productCode: parseInt(data.productCode),
        productName: data.productName,
        quantity: parseInt(data.quantity) || 0,
        vendorCode: 0,
        vendorName: '',
      }));
    } catch (error) {
      throw error;
    }
  }

  // CORREÇÃO PRINCIPAL: Todos os vendedores ativos aparecem no gráfico
  async getVendorsByCampaign(campaignId: number): Promise<CampaignVendorDTO[]> {
    try {
      const rawData: any[] = await this.manager.query(`
        SELECT 
          v.cd as "idVendedor",
          v."nmVendedor" as "vendorName",
          v."idEmail" as "email",
          v."cdEquipe" as "teamId",
          COALESCE(SUM(cv."vlMetafat"), 0) as "revenue",
          v."vlMetaMensal" as "goal"
        FROM ten_candy.cad_vendedor v
        LEFT JOIN ten_candy.cad_campanha_vendedor cv ON cv."cdVendedor" = v.cd
          AND cv."cdCampanha" = $1
          AND cv."fgAtivo" = true
        WHERE v."fgAtivo" = true
        GROUP BY v.cd, v."nmVendedor", v."idEmail", v."cdEquipe", v."vlMetaMensal"
        ORDER BY COALESCE(SUM(cv."vlMetafat"), 0) DESC, v."nmVendedor"
      `, [campaignId]);

      return rawData.map(data => ({
        vendorId: parseInt(data.idVendedor),
        vendorName: data.vendorName,
        email: data.email,
        teamId: parseInt(data.teamId),
        revenue: parseFloat(data.revenue) || 0,
        goal: parseFloat(data.goal) || 0,
      }));
    } catch (error) {
      throw error;
    }
  }

  async getCampaignProducts(campaignId: number): Promise<CampaignProductDTO[]> {
    try {
      const rawData: any[] = await this.manager.query(`
        SELECT DISTINCT
          ccv."cdProduto" as "CodigoProduto",
          cp."nmProduto" as "NomeProduto",
          ccv."qtProduto" as "QuantidadeProduto",
          ccv."cdVendedor" as "CodigoVendedor",
          cv."nmVendedor" as "NomeVendedor"
        FROM ten_candy.cad_campanha_vendedor ccv
        INNER JOIN ten_candy.cad_campanha cc ON ccv."cdCampanha" = cc.cd
        INNER JOIN ten_candy.cad_vendedor cv ON cv.cd = ccv."cdVendedor"
        INNER JOIN ten_candy.cad_produto cp ON cp.cd = ccv."cdProduto"
        WHERE cc.cd = $1
          AND ccv."fgAtivo" = true
          AND ccv."cdProduto" IS NOT NULL
        ORDER BY ccv."cdProduto", cv."nmVendedor"
      `, [campaignId]);

      return rawData.map(data => ({
        productCode: parseInt(data.CodigoProduto),
        productName: data.NomeProduto,
        quantity: parseInt(data.QuantidadeProduto) || 0,
        vendorCode: parseInt(data.CodigoVendedor),
        vendorName: data.NomeVendedor,
      }));
    } catch (error) {
      throw error;
    }
  }

  // CORREÇÃO: Query para vendedores por produto específico com meta e faturamento
  async getProductVendors(campaignId: number, productId: number): Promise<ProductVendorDTO[]> {
    try {
      const rawData: any[] = await this.manager.query(`
        SELECT 
          v.cd as "vendorId",
          v."nmVendedor" as "vendorName",
          COALESCE(cv."qtProduto", 0) as "sales",
          COALESCE(cv."qtProduto" * p."vlVenda", 0) as "revenue",
          COALESCE(cp."qtProdutoRef", 0) as "goal"
        FROM ten_candy.cad_vendedor v
        LEFT JOIN ten_candy.cad_campanha_vendedor cv ON cv."cdVendedor" = v.cd
          AND cv."cdCampanha" = $1
          AND cv."cdProduto" = $2
          AND cv."fgAtivo" = true
        LEFT JOIN ten_candy.cad_campanha_produto cp ON cp."cdCampanha" = $1
          AND cp."cdProduto" = $2
        LEFT JOIN ten_candy.cad_produto p ON p.cd = $2
        INNER JOIN ten_candy.cad_campanha c ON c.cd = $1
        WHERE v."cdEquipe" = c."cdvendedor"
          AND v."fgAtivo" = true
        ORDER BY COALESCE(cv."qtProduto", 0) DESC, v."nmVendedor"
      `, [campaignId, productId]);

      return rawData.map(data => ({
        vendorId: parseInt(data.vendorId),
        vendorName: data.vendorName,
        sales: parseInt(data.sales) || 0,
        goal: parseInt(data.goal) || 0,
        revenue: parseFloat(data.revenue) || 0,
      }));
    } catch (error) {
      throw error;
    }
  }

  async getCampaignById(campaignId: number): Promise<CadCampanhaEntity | undefined> {
    try {
      const campaign = await this.manager.findOne(CadCampanhaEntity, {
        where: { cd: campaignId },
      });

      return campaign;
    } catch (error) {
      throw error;
    }
  }

  async getVendorProductsByCampaign(campaignId: number, vendorId: number): Promise<any[]> {
    const rawData: any[] = await this.manager.query(`
      SELECT 
        p.cd as "productCode",
        p."nmProduto" as "productName",
        cv."qtProduto" as "quantity",
        cv."vlMetafat" as "goal"
      FROM ten_candy.cad_campanha_vendedor cv
      INNER JOIN ten_candy.cad_produto p ON p.cd = cv."cdProduto"
      WHERE cv."cdCampanha" = $1
        AND cv."cdVendedor" = $2
        AND cv."fgAtivo" = true
        AND cv."cdProduto" IS NOT NULL
      ORDER BY p."nmProduto"
    `, [campaignId, vendorId]);

    return rawData.map(data => ({
      productCode: parseInt(data.productCode),
      productName: data.productName,
      quantity: parseFloat(data.quantity) || 0,
      goal: parseFloat(data.goal) || 0,
    }));
  }
}