<template>
  <q-page padding>
    <!-- Primeira linha: Gráfico Principal e Gráfico de Vendedores -->
    <div class="row q-col-gutter-md">
      <!-- Gráfico 1: Faturamento Mensal Equipes (sempre visível) -->
      <div :class="selectedCampaign ? 'col-12 col-md-6' : 'col-12'">
        <q-card class="campaign-card">
          <q-card-section class="bg-primary text-white header-section">
            <div class="text-h6">Campanhas</div>
            <div>
              <q-btn flat round icon="arrow_back" color="white" to="/dashboard" />
            </div>
          </q-card-section>

          <q-card-section>
            <div class="chart-container">
              <div v-if="loading" class="loading-container">
                <q-spinner color="primary" size="3em" />
                <div class="q-ml-md">Carregando dados...</div>
              </div>
              <apexchart
                v-else-if="campaigns.length > 0"
                type="bar"
                height="400"
                :options="campaignChartOptions"
                :series="campaignChartSeries"
                @click="handleTeamClick"
              ></apexchart>
              
              <div v-else class="empty-message">
                <q-icon name="info" size="2em" color="grey-7" />
                <div class="q-mt-sm">Nenhuma campanha encontrada</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Gráfico 2: Campanha de Vendas - Vendedores -->
      <div v-if="selectedCampaign" class="col-12 col-md-6">
        <q-card class="campaign-card">
          <q-card-section class="bg-primary text-white header-section">
            <div class="text-h6">Campanha de Vendas - {{ selectedCampaign.name }}</div>
            <div>
              <q-btn flat round icon="arrow_back" color="white" @click="selectedCampaign = null; selectedSeller = null; selectedProduct = null" />
            </div>
          </q-card-section>

          <q-card-section>
            <div class="chart-container">
              <div v-if="loadingSellers" class="loading-container">
                <q-spinner color="primary" size="3em" />
                <div class="q-ml-md">Carregando vendedores...</div>
              </div>
              <apexchart
                v-else-if="sellers.length > 0"
                type="bar"
                height="400"
                :options="sellerChartOptions"
                :series="sellerChartSeries"
                @click="handleSellerClick"
              ></apexchart>
              <div v-else class="empty-message">
                <q-icon name="info" size="2em" color="grey-7" />
                <div class="q-mt-sm">Nenhum vendedor encontrado</div>
              </div>
            </div>
            <div class="q-mt-md">
              <div v-if="hasProducts" class="text-caption">
              </div>
              <div v-else class="text-caption">
                <!-- Se a campanha for somente de faturamento, ao clicar no vendedor<br>
                vai abrir a tela com os pedidos de venda da campanha. -->
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Segunda linha: Gráfico de Produtos -->
    <div v-if="selectedCampaign" class="row q-col-gutter-md q-mt-md">
      <div :class="selectedProduct && selectedSeller ? 'col-12 col-md-6' : 'col-12'">
        <q-card class="campaign-card">
          <q-card-section class="bg-primary text-white header-section">
            <div class="text-h6">Produtos da Campanha</div>
            <div>
              <q-btn flat round icon="arrow_back" color="white" @click="selectedProduct = null" />
            </div>
          </q-card-section>
          <q-card-section>
            <div class="total-products-container">
              <div v-if="loadingProducts" class="loading-container">
                <q-spinner color="primary" size="3em" />
                <div class="q-ml-md">Carregando produtos...</div>
              </div>
              <div v-else-if="campaignProducts.length === 0" class="empty-message">
                <q-icon name="info" size="2em" color="grey-7" />
                <div class="q-mt-sm">Nenhum produto encontrado</div>
              </div>
              <div v-for="(product, index) in campaignProducts" :key="product.productCode" class="product-bar q-mb-md" @click="handleProductClick(product)">
                <div class="product-info">
                  <div class="product-code">{{ product.productCode }}</div>
                  <div class="product-name">{{ product.productName }}</div>
                </div>
                <div class="product-bars">
                  <div class="bar-container">
                    <div class="bar-label">Venda: {{ product.quantity }} UN</div>
                    <q-linear-progress :value="product.quantity / maxValue" color="primary" class="q-mt-xs" style="height: 20px;" />
                  </div>
                  <div class="bar-container q-mt-sm">
                    <div class="bar-label">Meta: {{ product.unitValue }} UN</div>
                    <q-linear-progress :value="product.unitValue / maxValue" color="green" class="q-mt-xs" style="height: 20px;" />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Produtos do vendedor ao lado -->
      <div v-if="selectedProduct && selectedSeller && selectedProductVendor" class="col-12 col-md-6">
        <q-card class="campaign-card">
          <q-card-section class="bg-primary text-white header-section">
            <div class="text-h6">Produtos do Vendedor: {{ selectedSeller.name }}</div>
          </q-card-section>
          <q-card-section>
            <div class="product-info">
              <div class="product-code">{{ selectedProductVendor.productCode }}</div>
              <div class="product-name">{{ selectedProductVendor.productName }}</div>
            </div>
            <div class="product-bars">
              <div class="bar-container">
                <div class="bar-label">Venda: {{ selectedProductVendor.quantity }} UN</div>
                <q-linear-progress :value="selectedProductVendor.quantity / maxValue" color="primary" class="q-mt-xs" style="height: 20px;" />
              </div>
              <div class="bar-container q-mt-sm">
                <div class="bar-label">Meta: {{ selectedProductVendor.goal }} UN</div>
                <q-linear-progress :value="selectedProductVendor.goal / maxValue" color="green" class="q-mt-xs" style="height: 20px;" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick, watch } from 'vue'
import { useQuasar } from 'quasar'
import VueApexCharts from 'vue3-apexcharts'
import SalesCampaignService, { CampaignDTO } from 'src/services/SalesCampaignService'

interface Campaign {
  code: number
  name: string
  revenue: number
  goal: number
  hasProducts: boolean
  startDate?: string
  endDate?: string
  vlPercRef?: number
  qtDiasRef?: number
  teamId?: number
}

interface Seller {
  id: number
  name: string
  revenue: number
  goal: number
}

interface Product {
  productCode: number
  productName: string
  quantity: number
  unitValue: number
  totalValue: number
  campaignCode: number
}

interface ProductVendor {
  vendorId: number
  vendorName: string
  sales: number
  goal: number
}

export default defineComponent({
  name: 'SalesCampaignPage',
  components: {
    apexchart: VueApexCharts
  },

  setup () {
    const $q = useQuasar()
    const loading = ref(false)
    const loadingSellers = ref(false)
    const loadingProducts = ref(false)
    const loadingProductVendors = ref(false)
    const campaigns = ref<Campaign[]>([])
    const sellers = ref<Seller[]>([])
    const selectedCampaign = ref<Campaign | null>(null)
    const selectedSeller = ref<Seller | null>(null)
    const selectedProduct = ref<Product | null>(null)
    const selectedProductVendor = ref<any|null>(null)
    const hasProducts = ref(true)
    const campaignProducts = ref<Product[]>([])
    const allCampaignProducts = ref<Product[]>([])
    const productVendors = ref<ProductVendor[]>([])
    const vendorProducts = ref<any[]>([])
    const loadingVendorProducts = ref(false)

    // Carregar campanhas do backend
    const loadCampaigns = async () => {
      try {
        loading.value = true;
        
        // Garantir que o tenant ID esteja definido
        if (!localStorage.getItem('tenantId')) {
          localStorage.setItem('tenantId', 'candy');
        }
        
        const response = await SalesCampaignService.fetchCampaigns();
        
        if (Array.isArray(response) && response.length > 0) {
          campaigns.value = response.map((item: any) => ({
            code: item.code,
            name: item.name,
            revenue: parseFloat(item.faturamento || item.revenue || 0),
            goal: parseFloat(item.meta || item.goal || 0),
            hasProducts: true,
            startDate: item.startDate || item.dtInicio,
            endDate: item.endDate || item.dtFinal,
            qtDiasRef: item.qtDiasRef || 0,
            vlPercRef: item.vlPercRef || 0,
            teamId: item.teamId || 0
          }));
        } else {
          campaigns.value = [];
        }
        
        await nextTick();
      } catch (error) {
        console.error('Erro ao carregar campanhas:', error);
        $q.notify({
          message: 'Erro ao carregar campanhas',
          color: 'negative',
          position: 'top'
        });
        campaigns.value = [];
      } finally {
        loading.value = false;
      }
    };

    // Carregar vendedores de uma campanha
    const loadCampaignSellers = async (campaignId: number) => {
  try {
    loadingSellers.value = true;
    
    const response = await SalesCampaignService.getCampaignVendors(campaignId);
    
    if (Array.isArray(response) && response.length > 0) {
      sellers.value = response.map((item: any) => ({
        id: item.id || item.vendorId || 0,
        name: item.name || item.vendorName || 'Sem nome',
        revenue: parseFloat(item.revenue || item.sales || 0),
        goal: parseFloat(item.goal || item.targetValue || 0)
      }));
    } else {
      sellers.value = [];
    }
    
  } catch (error) {
    console.error('Erro ao carregar vendedores:', error);
    sellers.value = [];
  } finally {
    loadingSellers.value = false;
  }
};

    // Carregar produtos de uma campanha
    const loadCampaignProducts = async (campaignId: number) => {
      try {
        loadingProducts.value = true;
        const response = await SalesCampaignService.getCampaignProducts(campaignId);
        if (Array.isArray(response) && response.length > 0) {
          const mapped = response.map((item: any) => ({
            productCode: item.productCode || item.code || 0,
            productName: item.productName || item.name || `Produto ${item.productCode || item.code || 0}`,
            quantity: parseFloat(item.quantity || 0),
            unitValue: parseFloat(item.unitValue || 0),
            totalValue: parseFloat(item.totalValue || 0),
            campaignCode: campaignId
          }));
          campaignProducts.value = mapped;
          allCampaignProducts.value = mapped;
        } else {
          campaignProducts.value = [];
          allCampaignProducts.value = [];
        }
      } catch (error) {
        campaignProducts.value = [];
        allCampaignProducts.value = [];
        $q.notify({
          message: 'Erro ao carregar produtos da campanha',
          color: 'negative'
        });
      } finally {
        loadingProducts.value = false;
      }
    };

    // Carregar vendedores de um produto específico
    const loadProductVendors = async (campaignId: number, productId: number) => {
      try {
        loadingProductVendors.value = true;
        
        const response = await SalesCampaignService.getProductVendors(campaignId, productId);
        
        if (Array.isArray(response) && response.length > 0) {
          productVendors.value = response.map((item: any) => ({
            vendorId: item.vendorId || 0,
            vendorName: item.vendorName || `Vendedor ${item.vendorId || 0}`,
            sales: parseFloat(item.sales || 0),
            goal: parseFloat(item.targetValue || item.meta || item.goal || 0)
          }));
        } else {
          productVendors.value = [];
        }
        
      } catch (error) {
        console.error('Erro ao carregar vendedores do produto:', error);
        $q.notify({
          message: 'Erro ao carregar dados de vendedores por produto',
          color: 'negative'
        });
        productVendors.value = [];
      } finally {
        loadingProductVendors.value = false;
      }
    };

    const loadVendorProducts = async (campaignId: number, vendorId: number) => {
      try {
        loadingVendorProducts.value = true;
        const response = await SalesCampaignService.getVendorProducts(campaignId, vendorId);
        vendorProducts.value = response;
      } catch (error) {
        vendorProducts.value = [];
        $q.notify({ message: 'Erro ao carregar produtos do vendedor', color: 'negative' });
      } finally {
        loadingVendorProducts.value = false;
      }
    };

    // Inicialização
    onMounted(() => {
      const tenantId = localStorage.getItem('tenantId');
      if (!tenantId) {
        localStorage.setItem('tenantId', 'candy');
        $q.notify({
          message: 'Utilizando tenant padrão "candy"',
          color: 'warning',
          position: 'top'
        });
      }
      
      loadCampaigns();
    });

    // Valor máximo para escala das barras de produtos
    const maxValue = computed(() => {
      if (!campaignProducts.value.length) return 500;

      let max = 0;
      campaignProducts.value.forEach(product => {
        max = Math.max(max, product.quantity, product.unitValue);
      });

      return Math.ceil(max / 100) * 100;
    });

    // Opções do gráfico de campanhas
    const campaignChartOptions = computed(() => ({
      chart: {
        id: 'campaigns-chart',
        toolbar: { show: false },
        animations: { enabled: true }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '45%',
          endingShape: 'flat'
        }
      },
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: campaigns.value.map(c => c.name || 'Sem nome'),
        labels: {
          rotate: -40,
          rotateAlways: true,
          style: { fontSize: '12px' }
        }
      },
      yaxis: {
        title: { text: '' },
        labels: {
          formatter: function (value: number) {
            if (value === 0) return '0';
            return Math.round(value / 1000) + 'K';
          }
        },
        min: 0,
        forceNiceScale: true,
        tickAmount: 4
      },
      fill: { opacity: 1 },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (value: number) {
            return 'R$ ' + value.toLocaleString('pt-BR');
          }
        },
        custom: function({ dataPointIndex }: any) {
          if (!campaigns.value[dataPointIndex]) return '';
          
          const campaign = campaigns.value[dataPointIndex];
          
          let content = `<div class="tooltip-custom" style="background: white; color: #333; padding: 10px; border-radius: 5px; box-shadow: 0 3px 10px rgba(0,0,0,0.2); min-width: 200px;">`;
          content += `<div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${campaign.name}</div>`;
          content += `<div style="margin-bottom: 4px;"><span style="font-weight: 600;">Faturamento:</span> R$ ${(campaign.revenue || 0).toLocaleString('pt-BR')}</div>`;
          content += `<div style="margin-bottom: 4px;"><span style="font-weight: 600;">Meta:</span> R$ ${(campaign.goal || 0).toLocaleString('pt-BR')}</div>`;
          
          if (campaign.qtDiasRef) {
            content += `<div style="margin-bottom: 4px; color: #2980b9;"><span style="font-weight: 600;">Dias Ref.:</span> ${campaign.qtDiasRef}</div>`;
          }
          
          if (campaign.vlPercRef) {
            content += `<div style="margin-bottom: 4px; color: #2980b9;"><span style="font-weight: 600;">Perc. Ref.:</span> ${campaign.vlPercRef}%</div>`;
          }
          
          content += `</div>`;
          return content;
        }
      },
      colors: ['#4682B4', '#2ECC71'],
      legend: {
        position: 'top',
        horizontalAlign: 'center'
      }
    }));

    // Dados do gráfico de campanhas
    const campaignChartSeries = computed(() => [
      {
        name: 'Faturamento',
        data: campaigns.value.map(c => c.revenue || 0)
      },
      {
        name: 'Meta',
        data: campaigns.value.map(c => c.goal || 0)
      }
    ]);

    // Opções do gráfico de vendedores
    const sellerChartOptions = computed(() => {
      if (!selectedCampaign.value) return {};

      return {
        chart: {
          id: 'sellers-chart',
          toolbar: { show: false },
          animations: { enabled: true }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '45%',
            endingShape: 'flat'
          }
        },
        dataLabels: { enabled: false },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: sellers.value.map(s => s.name || 'Sem nome'),
          labels: {
            rotate: -40,
            rotateAlways: true,
            style: { fontSize: '12px' }
          }
        },
        yaxis: {
          title: { text: '' },
          labels: {
            formatter: function (value: number) {
              if (value === 0) return '0';
              return Math.round(value / 1000) + 'K';
            }
          },
          min: 0
        },
        fill: { opacity: 1 },
        tooltip: {
          y: {
            formatter: function (value: number) {
              return 'R$ ' + value.toLocaleString('pt-BR');
            }
          }
        },
        colors: ['#4682B4', '#2ECC71'],
        legend: {
          position: 'top',
          horizontalAlign: 'center'
        }
      };
    });

    // Dados do gráfico de vendedores
    const sellerChartSeries = computed(() => {
      if (!selectedCampaign.value) return [];

      return [
        {
          name: 'Faturamento',
          data: sellers.value.map(s => s.revenue || 0)
        },
        {
          name: 'Meta',
          data: sellers.value.map(s => s.goal || 0)
        }
      ];
    });

    // Função para lidar com clique no gráfico de campanhas
    const handleTeamClick = async (event: any, chartContext: any, config: { dataPointIndex: number }) => {
      if (config.dataPointIndex !== undefined) {
        const campaignIndex = config.dataPointIndex;
        if (campaignIndex >= 0 && campaignIndex < campaigns.value.length) {
          const selectedTeam = campaigns.value[campaignIndex];
          
          selectedCampaign.value = selectedTeam;
          hasProducts.value = true;
          
          await loadCampaignSellers(selectedTeam.code);
          await loadCampaignProducts(selectedTeam.code);
          
          selectedSeller.value = null;
          selectedProduct.value = null;
        }
      }
    };

    // Função para lidar com clique no gráfico de vendedores
    const handleSellerClick = async (event: any, chartContext: any, config: { dataPointIndex: number }) => {
      if (!selectedCampaign.value || config.dataPointIndex === undefined) return;
      const sellerIndex = config.dataPointIndex;
      if (sellerIndex >= 0 && sellerIndex < sellers.value.length) {
        selectedSeller.value = sellers.value[sellerIndex];
        await loadVendorProducts(selectedCampaign.value.code, selectedSeller.value.id);
        // Atualizar gráfico de produtos para mostrar apenas os do vendedor
        campaignProducts.value = vendorProducts.value.map((item: any) => ({
          productCode: item.productCode,
          productName: item.productName,
          quantity: item.quantity,
          unitValue: item.goal, // meta vira a barra verde
          totalValue: 0,
          campaignCode: selectedCampaign.value ? selectedCampaign.value.code : 0
        }));
      }
    };

    // Função para lidar com clique em um produto
    const handleProductClick = async (product: Product) => {
      selectedProduct.value = product;
      if (selectedSeller.value && selectedCampaign.value) {
        // Buscar detalhes do produto para o vendedor
        const response = await SalesCampaignService.getVendorProducts(selectedCampaign.value.code, selectedSeller.value.id);
        const found = response.find((p: any) => p.productCode === product.productCode);
        selectedProductVendor.value = found || null;
      } else {
        selectedProductVendor.value = null;
      }
    };

    // Ao desmarcar o vendedor, restaurar produtos gerais da campanha
    watch(selectedSeller, (newVal) => {
      if (!newVal) {
        campaignProducts.value = allCampaignProducts.value;
      }
    });

    // Adicionar botão de voltar para o modo geral
    const clearSellerSelection = () => {
      selectedSeller.value = null;
      selectedProduct.value = null;
      selectedProductVendor.value = null;
    };

    return {
      // Dados
      campaigns,
      selectedCampaign,
      selectedSeller,
      selectedProduct,
      hasProducts,
      campaignProducts,
      allCampaignProducts,
      sellers,
      productVendors,
      loading,
      loadingSellers,
      loadingProducts,
      loadingProductVendors,
      vendorProducts,
      loadingVendorProducts,
      
      // Propriedades computadas
      maxValue,
      campaignChartOptions,
      campaignChartSeries,
      sellerChartOptions,
      sellerChartSeries,
      
      // Métodos
      handleTeamClick,
      handleSellerClick,
      handleProductClick,
      loadVendorProducts,
      selectedProductVendor,
      clearSellerSelection
    };
  }
});
</script>

<style lang="scss" scoped>
.campaign-card {
  width: 100%;
  height: 100%;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  position: relative;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.total-products-container {
  position: relative;
  padding: 0 10px;
}

.product-bar {
  cursor: pointer;
  margin-bottom: 20px;
}

.product-info {
  margin-bottom: 5px;
}

.product-code {
  font-weight: bold;
  font-size: 14px;
  display: inline-block;
  margin-right: 10px;
}

.product-name {
  font-size: 14px;
  display: inline-block;
}

.bar-container {
  margin-top: 5px;
}

.bar-label {
  font-size: 12px;
  margin-bottom: 2px;
}

.empty-message {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

@media (max-width: 480px) {
  .product-name {
    display: block;
    margin-top: 5px;
  }
}

.q-card-section {
  &:first-child {
    padding-bottom: 0;
  }
  &:last-child {
    padding-top: 0;
  }
}
</style>