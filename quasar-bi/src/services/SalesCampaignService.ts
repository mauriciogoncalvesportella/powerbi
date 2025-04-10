import { apiProvider } from 'boot/axios'

// Interface para criação/atualização de campanhas
export interface CampaignDTO {
  id?: number;
  name: string;
  cdFabrica?: number;
  dtInicio: string;
  dtFinal: string;
  fgAtivo: number;
  vlCampanha: number;
  qtPositivacao: number;
  vlBonus: number;
}

// Interface para criação/atualização de produtos de campanha
export interface CampaignProductDTO {
  productId: number;
  productName: string;
  vlMeta: number;
}

// Interface para criação/atualização de vendedores de campanha
export interface CampaignVendorDTO {
  campaignId: number;
  productId?: number;
  vendorId: number;
  qtProduto: number;
  vlMetafat: number;
}

class SalesCampaignService {
  // Buscar todas as campanhas
  async fetchCampaigns () {
    try {
      const response = await apiProvider.axios.get('/campaigns')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error)
      throw error
    }
  }

  // Buscar uma campanha específica
  async getCampaign (id: number) {
    try {
      const response = await apiProvider.axios.get(`/campaigns/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar campanha ${id}:`, error)
      throw error
    }
  }

  // Criar uma nova campanha
  async createCampaign (campaignData: CampaignDTO) {
    try {
      const response = await apiProvider.axios.post('/campaigns', campaignData)
      return response.data
    } catch (error) {
      console.error('Erro ao criar campanha:', error)
      throw error
    }
  }

  // Atualizar uma campanha existente
  async updateCampaign (id: number, campaignData: Partial<CampaignDTO>) {
    try {
      const response = await apiProvider.axios.put(`/campaigns/${id}`, campaignData)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar campanha ${id}:`, error)
      throw error
    }
  }

  // Excluir uma campanha
  async deleteCampaign (id: number) {
    try {
      const response = await apiProvider.axios.delete(`/campaigns/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao excluir campanha ${id}:`, error)
      throw error
    }
  }

  // Buscar produtos de uma campanha
  async getCampaignProducts (campaignId: number) {
    try {
      const response = await apiProvider.axios.get(`/campaigns/${campaignId}/products`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar produtos para campanha ${campaignId}:`, error)
      throw error
    }
  }

  // Adicionar produto a uma campanha
  async addCampaignProduct (campaignId: number, productData: CampaignProductDTO) {
    try {
      const response = await apiProvider.axios.post(`/campaigns/${campaignId}/products`, productData)
      return response.data
    } catch (error) {
      console.error(`Erro ao adicionar produto à campanha ${campaignId}:`, error)
      throw error
    }
  }

  // Remover produto de uma campanha
  async removeCampaignProduct (campaignId: number, productId: number) {
    try {
      const response = await apiProvider.axios.delete(`/campaigns/${campaignId}/products/${productId}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao remover produto ${productId} da campanha ${campaignId}:`, error)
      throw error
    }
  }

  // Buscar vendedores de uma campanha
  async getCampaignVendors (campaignId: number) {
    try {
      const response = await apiProvider.axios.get(`/campaigns/${campaignId}/vendors`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar vendedores para campanha ${campaignId}:`, error)
      throw error
    }
  }

  // Buscar vendedores por produto em uma campanha
  async getProductVendors (campaignId: number, productId: number) {
    try {
      const response = await apiProvider.axios.get(`/campaigns/${campaignId}/products/${productId}/vendors`)
      return response.data
    } catch (error) {
      console.error(`Erro ao buscar vendedores para produto ${productId} na campanha ${campaignId}:`, error)
      throw error
    }
  }

  // Adicionar vendedor a uma campanha ou produto de campanha
  async addCampaignVendor (vendorData: CampaignVendorDTO) {
    try {
      const response = await apiProvider.axios.post('/campaigns/vendors', vendorData)
      return response.data
    } catch (error) {
      console.error('Erro ao adicionar vendedor à campanha:', error)
      throw error
    }
  }

  // Remover vendedor de uma campanha
  async removeCampaignVendor (id: number) {
    try {
      const response = await apiProvider.axios.delete(`/campaigns/vendors/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao remover vendedor ${id}:`, error)
      throw error
    }
  }
}

export default new SalesCampaignService()
