// src/bi/campaign/campaign.typeorm.service.ts
import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { EntityManager, In } from 'typeorm';
import { CadCampanhaProdutoEntity } from 'src/database/entity/tenant/cad_campanha_produto.entity';
import { CadCampanhaEntity } from 'src/database/entity/tenant/cad_campanha.entity';
import { CadProdutoEntity } from 'src/database/entity/tenant/cad_produto.entity'; 
import { CadVendedorEntity } from 'src/database/entity/tenant/cad_vendedor.entity';
import { VdPedidoEntity } from 'src/database/entity/tenant/vd_pedido.entity';
import { VdPedidoProdutoEntity } from 'src/database/entity/tenant/vd_pedido_produto.entity';
import { RequestMetadata } from 'src/shared/request-metadata.provider';
import { MultitenantConnection } from 'src/database/multitenant-connection';
import { CadEquipeEntity } from 'src/database/entity/tenant/cad_equipe.entity';
import { CadEquipeMetaMensalEntity } from 'src/database/entity/tenant/cad_equipe_meta_mensal.entity';
import { CadVendedorMetaMensalEntity } from 'src/database/entity/tenant/cad_vendedor_meta_mensal.entity';

@Injectable({ scope: Scope.REQUEST })
export class CampaignTypeOrmService {
  constructor(
    @Inject(MultitenantConnection)
    private multitenantConnection: MultitenantConnection,
    private requestMetadata: RequestMetadata
  ) {}

  // Método para obter o EntityManager para o tenant atual
  private getManager(): EntityManager {
    if (!this.multitenantConnection || !this.multitenantConnection.manager) {
      throw new Error('Conexão multitenant não disponível ou inválida');
    }
    return this.multitenantConnection.manager;
  }

  // Buscar campanha por código
  public async getCampaignByCode(code: number): Promise<any> {
    const manager = this.getManager();
    
    const campaign = await manager.findOne(CadCampanhaEntity, {
      where: { cd: code }
    });
    
    if (!campaign) {
      throw new NotFoundException(`Campanha com código ${code} não encontrada`);
    }
    
    return {
      code: campaign.cd,
      name: campaign.nmCampanha,
      startDate: campaign.dtInicio,
      endDate: campaign.dtFinal,
      status: campaign.fgAtivo,
      targetValue: campaign.vlCampanha,
      positiveQuantity: campaign.qtPositivacao,
      bonusValue: campaign.vlBonus,
      factory: campaign.cdFabrica
    };
  }

  // Listar todas as campanhas com dados de faturamento e meta
  public async getAllCampaigns(): Promise<any[]> {
    const manager = this.getManager();
    
    try {
      // Buscar todas as campanhas ativas
      const campaigns = await manager.find(CadCampanhaEntity, {
        where: { fgAtivo: 1 }
      });
      
      // Lista para armazenar os resultados formatados
      const result = [];
      
      // Para cada campanha, buscar os dados de faturamento
      for (const campaign of campaigns) {
        // Buscar produtos da campanha
        const campaignProducts = await manager.find(CadCampanhaProdutoEntity, {
          where: { cdCampanha: campaign.cd }
        });
        
        // Calcular meta total da campanha (somando metas de produtos, ou usando o vlCampanha)
        const metaTotal = campaign.vlCampanha || campaignProducts.reduce((sum, cp) => sum + (cp.vlTotal || 0), 0);
        
        // Buscar faturamento real (pedidos dos produtos da campanha no período)
        const produtosIds = campaignProducts.map(cp => cp.cdProduto);
        
        let faturamento = 0;
        
        if (produtosIds.length > 0) {
          // Buscar faturamento dos produtos da campanha no período
          try {
            const pedidosProdutos = await manager
              .createQueryBuilder(VdPedidoProdutoEntity, 'pedido_produto')
              .innerJoin(VdPedidoEntity, 'pedido', 'pedido_produto.cdPedido = pedido.cd')
              .where('pedido_produto.cdProduto IN (:...produtosIds)', { produtosIds })
              .andWhere('pedido.dtEmissao BETWEEN :dataInicio AND :dataFim', { 
                dataInicio: campaign.dtInicio, 
                dataFim: campaign.dtFinal 
              })
              .select('SUM(pedido_produto.vlTotal)', 'total')
              .getRawOne();
            
            faturamento = pedidosProdutos?.total || 0;
          } catch (error) {
            console.error('Erro ao buscar faturamento:', error);
            // Manter faturamento em 0 se houver erro
          }
        }
        
        // Adicionar ao resultado
        result.push({
          code: campaign.cd,
          name: campaign.nmCampanha,
          faturamento: faturamento,
          meta: metaTotal,
          hasProducts: campaignProducts.length > 0,
          startDate: campaign.dtInicio,
          endDate: campaign.dtFinal
        });
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error);
      // Retornar array vazio em caso de erro
      return [];
    }
  }
  
  // Buscar produtos da campanha
  public async getCampaignProducts(campaignCode: number): Promise<any[]> {
    const manager = this.getManager();
    
    try {
      const products = await manager
        .createQueryBuilder(CadCampanhaProdutoEntity, 'campanhaProduto')
        .leftJoinAndSelect(
          CadProdutoEntity, 
          'produto', 
          'campanhaProduto.cdProduto = produto.cd'
        )
        .where('campanhaProduto.cdCampanha = :campaignCode', { 
          campaignCode 
        })
        .getMany();
      
      return products.map(item => ({
        campaignCode: item.cdCampanha,
        productCode: item.cdProduto,
        quantity: item.qtProduto,
        unitValue: item.vlUnitario,
        totalValue: item.vlTotal,
        productName: item.produto ? item.produto.nmProduto : null
      }));
    } catch (error) {
      console.error('Erro ao buscar produtos da campanha:', error);
      
      // Retornar array vazio em caso de erro
      return [];
    }
  }

  // Método para buscar vendedores de uma campanha
  public async getCampaignVendors(campaignId: number): Promise<any[]> {
    const manager = this.getManager();
    
    try {
      const vendorsInCampaign = await manager
        .createQueryBuilder(CadVendedorEntity, 'vendedor')
        .where('vendedor.fgAtivo = :ativo', { ativo: 1 })
        // Adicione condições específicas de campanha se necessário
        .getMany();

      return vendorsInCampaign.map(vendor => ({
        id: vendor.cd,
        name: vendor.nmVendedor,
        email: vendor.idEmail,
        goal: vendor.vlMetaMensal,
        monthlyGoal: vendor.jsMetaMensal,
        active: vendor.fgAtivo,
        team: vendor.cdEquipe
      }));
    } catch (error) {
      console.error('Erro ao buscar vendedores da campanha:', error);
      
      // Retornar array vazio em caso de erro
      return [];
    }
  }

  // Obter vendas por vendedor para uma campanha
  public async getCampaignSalesByVendor(campaignId: number): Promise<any[]> {
    const manager = this.getManager();
    
    try {
      // Buscar a campanha
      const campaign = await manager.findOne(CadCampanhaEntity, {
        where: { cd: campaignId }
      });
      
      if (!campaign) {
        throw new NotFoundException(`Campanha ${campaignId} não encontrada`);
      }
      
      // Buscar produtos da campanha
      const campaignProducts = await manager.find(CadCampanhaProdutoEntity, {
        where: { cdCampanha: campaignId }
      });
      
      const produtosIds = campaignProducts.map(cp => cp.cdProduto);
      
      // Se não tem produtos, buscar por faturamento geral
      if (produtosIds.length === 0) {
        // Buscar vendedores com pedidos no período da campanha
        const vendedoresComVendas = await manager
          .createQueryBuilder(VdPedidoEntity, 'pedido')
          .innerJoin(CadVendedorEntity, 'vendedor', 'pedido.cdVendedor = vendedor.cd')
          .where('pedido.dtEmissao BETWEEN :dataInicio AND :dataFim', { 
            dataInicio: campaign.dtInicio, 
            dataFim: campaign.dtFinal 
          })
          .groupBy('vendedor.cd')
          .addGroupBy('vendedor.nmVendedor')
          .select('vendedor.cd', 'vendedorId')
          .addSelect('vendedor.nmVendedor', 'vendedorNome')
          .addSelect('SUM(pedido.vlTotal)', 'faturamento')
          .getRawMany();
        
        // Buscar metas dos vendedores
        const vendedores = await manager.find(CadVendedorEntity, {
          where: { fgAtivo: 1 }
        });
        
        // Calcular meta por vendedor (meta total da campanha dividida pelos vendedores ativos)
        const metaPorVendedor = campaign.vlCampanha / (vendedores.length || 1);
        
        // Formatar resultado
        return vendedoresComVendas.map(v => ({
          id: v.vendedorId,
          name: v.vendedorNome,
          revenue: parseFloat(v.faturamento || 0),
          goal: metaPorVendedor
        }));
      } else {
        // Se tem produtos, buscar vendas por vendedor para os produtos da campanha
        const vendedoresComVendas = await manager
          .createQueryBuilder(VdPedidoProdutoEntity, 'pedido_produto')
          .innerJoin(VdPedidoEntity, 'pedido', 'pedido_produto.cdPedido = pedido.cd')
          .innerJoin(CadVendedorEntity, 'vendedor', 'pedido.cdVendedor = vendedor.cd')
          .where('pedido_produto.cdProduto IN (:...produtosIds)', { produtosIds })
          .andWhere('pedido.dtEmissao BETWEEN :dataInicio AND :dataFim', { 
            dataInicio: campaign.dtInicio, 
            dataFim: campaign.dtFinal 
          })
          .groupBy('vendedor.cd')
          .addGroupBy('vendedor.nmVendedor')
          .select('vendedor.cd', 'vendedorId')
          .addSelect('vendedor.nmVendedor', 'vendedorNome')
          .addSelect('SUM(pedido_produto.vlTotal)', 'faturamento')
          .getRawMany();
        
        // Calcular metas por vendedor
        const vendedores = await manager.find(CadVendedorEntity, {
          where: { fgAtivo: 1 }
        });
        
        // Calcular meta por vendedor baseada nos produtos da campanha
        const metaTotalCampanha = campaignProducts.reduce((sum, cp) => sum + (cp.vlTotal || 0), 0);
        const metaPorVendedor = metaTotalCampanha / (vendedores.length || 1);
        
        // Formatar resultado
        return vendedoresComVendas.map(v => ({
          id: v.vendedorId,
          name: v.vendedorNome,
          revenue: parseFloat(v.faturamento || 0),
          goal: metaPorVendedor
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar vendas por vendedor:', error);
      return [];
    }
  }
  
  // Obter desempenho de produto por vendedor
  public async getProductVendorPerformance(campaignId: number, productId: number): Promise<any[]> {
    const manager = this.getManager();
    
    try {
      // Buscar a campanha e o produto
      const campaign = await manager.findOne(CadCampanhaEntity, {
        where: { cd: campaignId }
      });
      
      if (!campaign) {
        throw new NotFoundException(`Campanha ${campaignId} não encontrada`);
      }
      
      // Buscar o produto da campanha
      const campaignProduct = await manager.findOne(CadCampanhaProdutoEntity, {
        where: { 
          cdCampanha: campaignId,
          cdProduto: productId
        }
      });
      
      if (!campaignProduct) {
        throw new NotFoundException(`Produto ${productId} não encontrado na campanha ${campaignId}`);
      }
      
      // Buscar vendas do produto por vendedor
      const vendedoresComVendas = await manager
        .createQueryBuilder(VdPedidoProdutoEntity, 'pedido_produto')
        .innerJoin(VdPedidoEntity, 'pedido', 'pedido_produto.cdPedido = pedido.cd')
        .innerJoin(CadVendedorEntity, 'vendedor', 'pedido.cdVendedor = vendedor.cd')
        .where('pedido_produto.cdProduto = :productId', { productId })
        .andWhere('pedido.dtEmissao BETWEEN :dataInicio AND :dataFim', { 
          dataInicio: campaign.dtInicio, 
          dataFim: campaign.dtFinal 
        })
        .groupBy('vendedor.cd')
        .addGroupBy('vendedor.nmVendedor')
        .select('vendedor.cd', 'vendorId')
        .addSelect('vendedor.nmVendedor', 'vendorName')
        .addSelect('SUM(pedido_produto.qtProduto)', 'sales')
        .addSelect('SUM(pedido_produto.vlTotal)', 'amount')
        .getRawMany();
      
      // Buscar vendedores ativos
      const vendedores = await manager.find(CadVendedorEntity, {
        where: { fgAtivo: 1 }
      });
      
      // Calcular meta por vendedor para este produto
      const metaQuantidadeProduto = campaignProduct.qtProduto || 0;
      const metaPorVendedor = metaQuantidadeProduto / (vendedores.length || 1);
      
      // Formatar resultado
      return vendedoresComVendas.map(v => ({
        vendorId: v.vendorId,
        vendorName: v.vendorName,
        sales: parseInt(v.sales || 0),
        goal: metaPorVendedor
      }));
    } catch (error) {
      console.error('Erro ao buscar desempenho do produto por vendedor:', error);
      return [];
    }
  }
  
  // Criar uma nova campanha
  public async createCampaign(campaignData: any): Promise<any> {
    const manager = this.getManager();
    
    try {
      // Gerar código para nova campanha (último código + 1)
      const lastCampaign = await manager
        .createQueryBuilder(CadCampanhaEntity, 'campanha')
        .orderBy('campanha.cd', 'DESC')
        .limit(1)
        .getOne();
      
      const newCode = lastCampaign ? lastCampaign.cd + 1 : 1;
      
      // Criar nova campanha
      const newCampaign = manager.create(CadCampanhaEntity, {
        cd: newCode,
        nmCampanha: campaignData.name,
        dtInicio: campaignData.dtInicio,
        dtFinal: campaignData.dtFinal,
        fgAtivo: campaignData.fgAtivo ? 1 : 0,
        vlCampanha: campaignData.vlCampanha || 0,
        qtPositivacao: campaignData.qtPositivacao || 0,
        vlBonus: campaignData.vlBonus || 0,
        cdFabrica: campaignData.cdFabrica || null,
        cdVendedor: campaignData.cdvendedor || null
      });
      
      // Salvar campanha
      await manager.save(CadCampanhaEntity, newCampaign);
      
      return {
        code: newCampaign.cd,
        name: newCampaign.nmCampanha,
        startDate: newCampaign.dtInicio,
        endDate: newCampaign.dtFinal,
        status: newCampaign.fgAtivo,
        targetValue: newCampaign.vlCampanha
      };
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      throw error;
    }
  }

  // Adicionar métodos para faturamento por equipe
  public async getTeamMonthlyRevenue(): Promise<any[]> {
    const manager = this.getManager();
    const currentYearMonth = new Date().toISOString().substring(0, 7).replace('-', '');
    
    try {
      // Buscar todas as equipes
      const teams = await manager.find(CadEquipeEntity, {
        where: { fgAtivo: 1 }
      });
      
      const result = [];
      
      // Para cada equipe, buscar faturamento e meta
      for (const team of teams) {
        // Buscar meta da equipe para o mês atual
        const teamGoal = await manager
          .createQueryBuilder(CadEquipeMetaMensalEntity, 'meta')
          .where('meta.cdEquipe = :teamId', { teamId: team.cd })
          .andWhere('meta.idMesAno = :yearMonth', { yearMonth: currentYearMonth })
          .getOne();
        
        // Buscar vendedores desta equipe
        const sellers = await manager
          .createQueryBuilder(CadVendedorEntity, 'vendedor')
          .where('vendedor.cdEquipe = :teamId', { teamId: team.cd })
          .andWhere('vendedor.fgAtivo = 1')
          .getMany();
        
        const sellerIds = sellers.map(s => s.cd);
        
        // Buscar faturamento total dos vendedores desta equipe no mês atual
        let revenue = 0;
        if (sellerIds.length > 0) {
          const revenueResult = await manager
            .createQueryBuilder(VdPedidoEntity, 'pedido')
            .select('SUM(pedido.vlTotal)', 'total')
            .where('pedido.cdVendedor IN (:...sellerIds)', { sellerIds })
            .andWhere('pedido.idMesAno = :yearMonth', { yearMonth: currentYearMonth })
            .andWhere('pedido.fgSituacao IN (2, 4, 5)') // Pedidos aprovados, faturados ou com NF
            .getRawOne();
          
          revenue = revenueResult?.total || 0;
        }
        
        // Adicionar ao resultado
        result.push({
          code: team.cd,
          name: team.nmEquipe,
          revenue: revenue,
          goal: teamGoal ? teamGoal.vlMetaVenda : 0,
          hasProducts: false // Equipes não têm produtos associados
        });
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar faturamento mensal por equipe:', error);
      return [];
    }
  }

  // Método para obter desempenho de vendedores com metas mensais
  public async getSellerMonthlyPerformance(teamId: number): Promise<any[]> {
    const manager = this.getManager();
    const currentYearMonth = new Date().toISOString().substring(0, 7).replace('-', '');
    
    try {
      // Buscar vendedores da equipe
      const sellers = await manager
        .createQueryBuilder(CadVendedorEntity, 'vendedor')
        .where('vendedor.cdEquipe = :teamId', { teamId })
        .andWhere('vendedor.fgAtivo = 1')
        .getMany();
      
      const result = [];
      
      // Para cada vendedor, buscar faturamento e meta
      for (const seller of sellers) {
        // Buscar meta do vendedor para o mês atual
        const sellerGoal = await manager
          .createQueryBuilder(CadVendedorMetaMensalEntity, 'meta')
          .where('meta.cdVendedor = :sellerId', { sellerId: seller.cd })
          .andWhere('meta.idMesAno = :yearMonth', { yearMonth: currentYearMonth })
          .getOne();
        
        // Buscar faturamento do vendedor no mês atual
        const revenueResult = await manager
          .createQueryBuilder(VdPedidoEntity, 'pedido')
          .select('SUM(pedido.vlTotal)', 'total')
          .where('pedido.cdVendedor = :sellerId', { sellerId: seller.cd })
          .andWhere('pedido.idMesAno = :yearMonth', { yearMonth: currentYearMonth })
          .andWhere('pedido.fgSituacao IN (2, 4, 5)') // Pedidos aprovados, faturados ou com NF
          .getRawOne();
        
        result.push({
          id: seller.cd,
          name: seller.nmVendedor,
          revenue: parseFloat(revenueResult?.total || 0),
          goal: sellerGoal ? sellerGoal.vlMetaVenda : 0
        });
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar desempenho mensal dos vendedores:', error);
      return [];
    }
  }
}