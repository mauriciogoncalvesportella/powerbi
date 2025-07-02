import { apiProvider } from 'src/boot/axios';

export interface CampaignDTO {
  code: number;
  name: string;
  revenue: number;
  goal: number;
  teamId: number;
  qtDiasRef?: number;
  vlPercRef?: number;
  startDate?: string;
  endDate?: string;
  hasProducts: boolean;
}

export interface VendorDTO {
  id: number;
  name: string;
  revenue: number;
  goal: number;
  email: string;
  teamId: number;
}

export interface ProductDTO {
  productCode: number;
  productName: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  campaignCode: number;
}

export interface ProductVendorDTO {
  vendorId: number;
  vendorName: string;
  sales: number;
  goal: number;
}

class SalesCampaignService {
  
  /**
   * Busca todas as campanhas ativas
   */
  async fetchCampaigns(): Promise<CampaignDTO[]> {
    try {
      
      const response = await apiProvider.axios.get('/bi/sales/campaign');
      
      if (!Array.isArray(response.data)) {
        return [];
      }

      const mappedData: CampaignDTO[] = response.data.map((item: any) => ({
        code: item.campaignCode || item.code,
        name: item.campaignName || item.name || 'Campanha sem nome',
        revenue: parseFloat(item.revenue || 0),
        goal: parseFloat(item.target || item.goal || 0),
        teamId: item.teamId || 1,
        qtDiasRef: item.qtDiasRef || 0,
        vlPercRef: item.vlPercRef || 0,
        hasProducts: true, // Assumimos que todas têm produtos para simplicidade
        startDate: item.startDate || null,
        endDate: item.endDate || null
      }));

      return mappedData;
      
    } catch (error: any) {
      
      throw new Error(`Erro ao buscar campanhas: ${error.message}`);
    }
  }

  /**
   * Busca vendedores de uma equipe específica
   */
  async getTeamVendors(teamId: number): Promise<VendorDTO[]> {
    try {
      
      const response = await apiProvider.axios.get(`/bi/sales/campaign/team/${teamId}/vendors`);
      
      if (!Array.isArray(response.data)) {
        return [];
      }

      const mappedVendors: VendorDTO[] = response.data.map((vendor: any) => ({
        id: vendor.vendorId || vendor.id,
        name: vendor.vendorName || vendor.name || `Vendedor ${vendor.vendorId || vendor.id}`,
        revenue: parseFloat(vendor.revenue || 0),
        goal: parseFloat(vendor.goal || 0),
        email: vendor.email || '',
        teamId: vendor.teamId || teamId
      }));
      
      return mappedVendors;
      
    } catch (error: any) {
      throw new Error(`Erro ao buscar vendedores da equipe: ${error.message}`);
    }
  }

  /**
   * Busca produtos de uma campanha específica
   */
  async getCampaignProducts(campaignId: number): Promise<ProductDTO[]> {
    try {
      
      const response = await apiProvider.axios.get(`/bi/sales/campaign/${campaignId}/products`);
      
      if (!Array.isArray(response.data)) {
        return [];
      }

      const mappedProducts: ProductDTO[] = response.data.map((product: any) => ({
        productCode: product.productCode || product.code,
        productName: product.productName || product.name || `Produto ${product.productCode || product.code}`,
        quantity: parseInt(product.quantity || 0),
        unitValue: parseInt(product.unitValue || 0),
        totalValue: parseFloat(product.totalValue || 0),
        campaignCode: product.campaignCode || campaignId
      }));
      return mappedProducts;
      
    } catch (error: any) {
      throw new Error(`Erro ao buscar produtos da campanha: ${error.message}`);
    }
  }

  /**
   * Busca vendedores de um produto específico em uma campanha
   */
  async getProductVendors(campaignId: number, productId: number): Promise<ProductVendorDTO[]> {
    try {
      
      const response = await apiProvider.axios.get(`/bi/sales/campaign/${campaignId}/products/${productId}/vendors`);
      
      if (!Array.isArray(response.data)) {
        return [];
      }

      const mappedVendors: ProductVendorDTO[] = response.data.map((vendor: any) => ({
        vendorId: vendor.vendorId || vendor.id,
        vendorName: vendor.vendorName || vendor.name || `Vendedor ${vendor.vendorId || vendor.id}`,
        sales: parseInt(vendor.sales || 0),
        goal: parseInt(vendor.goal || 0)
      }));
      
      return mappedVendors;
      
    } catch (error: any) {
      throw new Error(`Erro ao buscar vendedores do produto: ${error.message}`);
    }
  }

  /**
   * Busca vendedores de uma campanha específica
   */
  async getCampaignVendors(campaignId: number): Promise<VendorDTO[]> {
    try {
      
      const response = await apiProvider.axios.get(`/bi/sales/campaign/${campaignId}/vendors`);
      
      if (!Array.isArray(response.data)) {
        return [];
      }

      const mappedVendors: VendorDTO[] = response.data.map((vendor: any) => ({
        id: vendor.vendorId || vendor.id,
        name: vendor.vendorName || vendor.name || `Vendedor ${vendor.vendorId || vendor.id}`,
        revenue: parseFloat(vendor.revenue || 0),
        goal: parseFloat(vendor.goal || 0),
        email: vendor.email || '',
        teamId: vendor.teamId || 0
      }));
      
      return mappedVendors;
      
    } catch (error: any) {
      throw new Error(`Erro ao buscar vendedores da campanha: ${error.message}`);
    }
  }

  /**
   * Busca uma campanha específica por ID
   */
  async getCampaignById(campaignId: number): Promise<any> {
    try {
      
      const response = await apiProvider.axios.get(`/bi/sales/campaign/${campaignId}`);
      
      return response.data;
      
    } catch (error: any) {
      console.error(`❌ Erro ao buscar campanha ${campaignId}:`, error);
      throw new Error(`Erro ao buscar campanha: ${error.message}`);
    }
  }

  /**
   * Busca produtos de um vendedor em uma campanha
   */
  async getVendorProducts(campaignId: number, vendorId: number): Promise<any[]> {
    const response = await apiProvider.axios.get(`/bi/sales/campaign/${campaignId}/vendor/${vendorId}/products`);
    return response.data;
  }

  // ===============================================
  // MÉTODOS DE APOIO E UTILIDADES
  // ===============================================

  /**
   * Verifica se o serviço está funcionando
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.fetchCampaigns();
      return true;
    } catch (error) {
      console.error('❌ Health check falhou:', error);
      return false;
    }
  }

  /**
   * Formata valores monetários para exibição
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formata datas para exibição
   */
  formatDate(date: string | Date): string {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR').format(dateObj);
  }

  /**
   * Calcula percentual de atingimento da meta
   */
  calculateGoalPercentage(achieved: number, goal: number): number {
    if (goal === 0) return 0;
    return Math.round((achieved / goal) * 100);
  }
}

// Exportar instância única do serviço
export default new SalesCampaignService();