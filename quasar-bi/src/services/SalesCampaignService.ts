import { apiProvider } from 'src/boot/axios';

export interface CampaignDTO {
  name: string;
  dtInicio: string;
  dtFinal: string;
  fgAtivo: number;
  vlCampanha: number;
  qtPositivacao: number;
  vlBonus: number;
  cdFabrica?: number;
}

class SalesCampaignService {
  // Buscar todas as campanhas para o gráfico principal
  async fetchCampaigns() {
    try {
      const response = await apiProvider.axios.get('/bi/campaign');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error);
      throw error;
    }
  }

  // Buscar detalhes de uma campanha específica
  async getCampaignById(campaignId: number) {
    try {
      const response = await apiProvider.axios.get(`/bi/campaign/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar campanha ${campaignId}:`, error);
      throw error;
    }
  }

  async getTeamMonthlyRevenue() {
    try {
      const response = await apiProvider.axios.get('/bi/campaign/team-revenue');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar faturamento mensal por equipe:', error);
      throw error;
    }
  }

  async getTeamSellers(teamId: number) {
    try {
      const response = await apiProvider.axios.get(`/bi/campaign/team/${teamId}/sellers`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar vendedores da equipe ${teamId}:`, error);
      throw error;
    }
  }

  // Buscar produtos de uma campanha
  async getCampaignProducts(campaignId: number) {
    try {
      const response = await apiProvider.axios.get(`/bi/campaign/${campaignId}/products`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar produtos da campanha ${campaignId}:`, error);
      throw error;
    }
  }

  // Buscar vendedores de uma campanha com desempenho
  async getCampaignVendors(campaignId: number) {
    try {
      const response = await apiProvider.axios.get(`/bi/campaign/${campaignId}/vendors`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar vendedores da campanha ${campaignId}:`, error);
      throw error;
    }
  }

  // Buscar desempenho de vendedores para um produto específico
  async getProductVendors(campaignId: number, productId: number) {
    try {
      const response = await apiProvider.axios.get(`/bi/campaign/${campaignId}/products/${productId}/vendors`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar vendedores do produto ${productId}:`, error);
      throw error;
    }
  }

  // Criar nova campanha
  async createCampaign(campaignData: CampaignDTO) {
    try {
      const response = await apiProvider.axios.post('/bi/campaign', campaignData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      throw error;
    }
  }

  // Atualizar campanha existente
  async updateCampaign(campaignId: number, campaignData: CampaignDTO) {
    try {
      const response = await apiProvider.axios.put(`/bi/campaign/${campaignId}`, campaignData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar campanha ${campaignId}:`, error);
      throw error;
    }
  }

  // Excluir campanha
  async deleteCampaign(campaignId: number) {
    try {
      const response = await apiProvider.axios.delete(`/bi/campaign/${campaignId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir campanha ${campaignId}:`, error);
      throw error;
    }
  }

  // Adicionar produto a uma campanha
  async addCampaignProduct(campaignId: number, productData: any) {
    try {
      const response = await apiProvider.axios.post(`/bi/campaign/${campaignId}/products`, productData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao adicionar produto à campanha ${campaignId}:`, error);
      throw error;
    }
  }

  // Remover produto de uma campanha
  async removeCampaignProduct(campaignId: number, productId: number) {
    try {
      const response = await apiProvider.axios.delete(`/bi/campaign/${campaignId}/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao remover produto ${productId} da campanha ${campaignId}:`, error);
      throw error;
    }
  }
}

export default new SalesCampaignService();