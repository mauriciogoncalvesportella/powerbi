<template>
  
  <q-page padding>
    <!-- Primeira linha: Gráfico Principal e Gráfico de Vendedores -->
    <div class="row q-col-gutter-md">
      <!-- Gráfico 1: Faturamento Mensal Equipes (sempre visível) -->
      <div :class="selectedCampaign ? 'col-12 col-md-6' : 'col-12'">
        <q-card class="campaign-card">
          <q-card-section class="bg-primary text-white header-section">
            <div class="text-h6">Faturamento Mensal Equipes</div>
            <div>
              <q-btn flat round icon="arrow_back" color="white" to="/dashboard" />
              <!-- <q-toggle v-model="useMockData" label="Usar dados de teste" dense class="q-ml-sm" /> -->
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
                @click="handleCampaignClick"
              ></apexchart>
              <div v-else class="empty-message">
                <q-icon name="info" size="2em" color="grey-7" />
                <div class="q-mt-sm">Nenhuma campanha encontrada</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Gráfico 2: Campanha de Vendas - Vendedores (visível quando uma campanha é selecionada) -->
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
                Se a campanha tiver produtos, clique no vendedor para ver a análise de produtos.
              </div>
              <div v-else class="text-caption">
                Se a campanha for somente de faturamento, ao clicar no vendedor<br>
                vai abrir a tela com os pedidos de venda da campanha.
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Segunda linha: Gráfico de Produtos Total e Produtos x Vendedor -->
    <div v-if="selectedCampaign && hasProducts" class="row q-col-gutter-md q-mt-md">
      <!-- Gráfico 3: Gráfico de Produtos Total / ou por vendedor -->
      <div :class="selectedProduct ? 'col-12 col-md-6' : 'col-12'">
        <q-card class="campaign-card">
          <q-card-section class="bg-primary text-white header-section">
            <div class="text-h6">Gráfico de Produtos Total / ou por vendedor</div>
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

      <!-- Gráfico 4: Gráfico Produtos x Vendedor (visível quando um produto é selecionado) -->
      <div v-if="selectedProduct" class="col-12 col-md-6">
        <q-card class="campaign-card">
          <q-card-section class="bg-primary text-white header-section">
            <div class="text-h6">Gráfico Produtos x Vendedor</div>
            <div>
              <q-btn flat round icon="arrow_back" color="white" @click="selectedProduct = null" />
            </div>
          </q-card-section>

          <q-card-section>
            <div class="chart-container">
              <div v-if="loadingProductVendors" class="loading-container">
                <q-spinner color="primary" size="3em" />
                <div class="q-ml-md">Carregando dados...</div>
              </div>
              <apexchart
                v-else-if="productVendors.length > 0"
                type="bar"
                height="400"
                :options="productVendorChartOptions"
                :series="productVendorChartSeries"
              ></apexchart>
              <div v-else class="empty-message">
                <q-icon name="info" size="2em" color="grey-7" />
                <div class="q-mt-sm">Nenhum dado encontrado</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Botão de Nova Campanha -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn color="primary" label="NOVA CAMPANHA" @click="createCampaign" />
    </q-page-sticky>

    <!-- Modal/Dialog de criação de campanha -->
    <q-dialog v-model="showNewCampaignDialog" persistent>
  <q-card>
    <q-card-section>
      <div class="text-h6">Nova Campanha</div>
    </q-card-section>

    <q-card-section>
      <q-input 
        v-model="newCampaign.name" 
        label="Nome da Campanha" 
        outlined
        dense
        :rules="[val => !!val || 'Nome é obrigatório']" 
      />
      
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-input 
            v-model="newCampaign.dtInicio" 
            type="date" 
            label="Data Início" 
            outlined
            dense
            :rules="[val => !!val || 'Data é obrigatória']" 
          />
        </div>
        <div class="col-6">
          <q-input 
            v-model="newCampaign.dtFinal" 
            type="date" 
            label="Data Final" 
            outlined
            dense
            :rules="[val => !!val || 'Data é obrigatória']" 
          />
        </div>
      </div>
      
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-input 
            v-model.number="newCampaign.vlCampanha" 
            type="number" 
            label="Valor Meta" 
            outlined
            dense
          />
        </div>
        <div class="col-6">
          <q-input 
            v-model.number="newCampaign.qtPositivacao" 
            type="number" 
            label="Qtde Positivação" 
            outlined
            dense
          />
        </div>
      </div>
      
      <q-input 
        v-model.number="newCampaign.vlBonus" 
        type="number" 
        label="Valor Bônus" 
        outlined
        dense
      />
      
      <q-toggle 
        v-model="newCampaign.fgAtivo" 
        label="Campanha Ativa" 
        class="q-mt-md"
      />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancelar" color="primary" v-close-popup />
      <q-btn flat label="Salvar" color="primary" @click="saveCampaign" :loading="saving" />
    </q-card-actions>
  </q-card>
</q-dialog>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import VueApexCharts from 'vue3-apexcharts'
import SalesCampaignService, { CampaignDTO } from 'src/services/SalesCampaignService'
import { apiProvider } from 'src/boot/axios'

interface Campaign {
  code: number
  name: string
  revenue: number
  goal: number
  hasProducts: boolean
  startDate?: string
  endDate?: string
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
    const saving = ref(false)
    const campaigns = ref<Campaign[]>([])
    const sellers = ref<Seller[]>([])
    const selectedCampaign = ref<Campaign | null>(null)
    const selectedSeller = ref<Seller | null>(null)
    const selectedProduct = ref<Product | null>(null)
    const hasProducts = ref(false)
    const campaignProducts = ref<Product[]>([])
    const productVendors = ref<ProductVendor[]>([])
    const showNewCampaignDialog = ref(false)
    const useMockData = ref(false) // Opção para usar dados mockados
    
    const newCampaign = ref<CampaignDTO>({
      name: '',
      dtInicio: '',
      dtFinal: '',
      fgAtivo: 1,
      vlCampanha: 0,
      qtPositivacao: 0,
      vlBonus: 0
    })

    // Mockdata para teste da interface
    const mockCampaigns = [
      { code: 1, name: 'Santo Antonio', revenue: 95000, goal: 98000, hasProducts: true, startDate: '2025-01-01', endDate: '2025-06-30' },
      { code: 2, name: 'Fiat', revenue: 82000, goal: 90000, hasProducts: true, startDate: '2025-02-01', endDate: '2025-07-30' },
      { code: 3, name: 'Riclan', revenue: 58000, goal: 78000, hasProducts: true, startDate: '2025-03-01', endDate: '2025-08-30' }
    ];

    const mockSellers = {
      1: [ // Santo Antonio
        { id: 1, name: 'MARA C', revenue: 90000, goal: 95000 },
        { id: 2, name: 'VALDIR LEIVA', revenue: 85000, goal: 90000 },
        { id: 3, name: 'RUTE', revenue: 60000, goal: 80000 },
        { id: 4, name: 'KARIN MARA', revenue: 35000, goal: 0 },
        { id: 5, name: 'RAFAEL MIGUEL', revenue: 30000, goal: 0 },
        { id: 6, name: 'JOEL SALETE', revenue: 15000, goal: 0 }
      ],
      2: [ // Fiat
        { id: 7, name: 'Carlos', revenue: 40000, goal: 45000 },
        { id: 8, name: 'Ana', revenue: 30000, goal: 32000 },
        { id: 9, name: 'Pedro', revenue: 15000, goal: 20000 }
      ],
      3: [ // Riclan
        { id: 10, name: 'Julia', revenue: 30000, goal: 35000 },
        { id: 11, name: 'Marcos', revenue: 20000, goal: 25000 },
        { id: 12, name: 'Lucia', revenue: 10000, goal: 15000 }
      ],
      // Adicione um fallback para campanhas sem ID específico no mockdata
      default: [
        { id: 101, name: 'Vendedor Padrão 1', revenue: 50000, goal: 60000 },
        { id: 102, name: 'Vendedor Padrão 2', revenue: 45000, goal: 55000 },
        { id: 103, name: 'Vendedor Padrão 3', revenue: 30000, goal: 40000 }
      ]
    };

    const mockProducts = {
      1: [ // Santo Antonio
        { productCode: 1543, productName: 'Bala Gelatina Fini Beijos de Morango 12pcX90g', quantity: 263, unitValue: 346, totalValue: 9098, campaignCode: 1 },
        { productCode: 1544, productName: 'Bala Gelatina Fini Dentaduras 12pcX90g', quantity: 187, unitValue: 441, totalValue: 8246, campaignCode: 1 }
      ],
      // Adicione dados default para campanhas que não estão especificadas
      default: [
        { productCode: 9001, productName: 'Produto Padrão 1', quantity: 200, unitValue: 300, totalValue: 60000, campaignCode: 0 },
        { productCode: 9002, productName: 'Produto Padrão 2', quantity: 150, unitValue: 350, totalValue: 52500, campaignCode: 0 }
      ]
    };

    const mockProductVendors = {
      1543: [ // Produto Bala Gelatina
        { vendorId: 1, vendorName: 'MARA C', sales: 52, goal: 60 },
        { vendorId: 2, vendorName: 'VALDIR LEIVA', sales: 36, goal: 56 },
        { vendorId: 3, vendorName: 'RUTE', sales: 38, goal: 80 }
      ],
      // Adicione dados default para produtos não especificados
      default: [
        { vendorId: 101, vendorName: 'Vendedor Produto 1', sales: 40, goal: 50 },
        { vendorId: 102, vendorName: 'Vendedor Produto 2', sales: 35, goal: 45 },
        { vendorId: 103, vendorName: 'Vendedor Produto 3', sales: 25, goal: 35 }
      ]
    };

    // Carregar campanhas
    const loadCampaigns = async () => {
      try {
        loading.value = true;
        
        if (useMockData.value) {
          campaigns.value = mockCampaigns;
          
          // Verifique as opções do gráfico após dados serem carregados
          await nextTick();
          console.log('Categorias do gráfico:', campaigns.value.map(c => c.name));
          console.log('Valores de revenue:', campaigns.value.map(c => c.revenue));
          console.log('Valores de goal:', campaigns.value.map(c => c.goal));
          
          setTimeout(() => {
            loading.value = false;
          }, 500);
          return;
        }
        
        // Garantir que o tenant ID esteja definido
        if (!localStorage.getItem('tenantId')) {
          localStorage.setItem('tenantId', 'candy');
          console.log('Definindo tenant ID padrão: candy');
        }
        
        // Adicione um interceptor temporário para ver os headers
        const interceptor = apiProvider.axios.interceptors.request.use(request => {
          console.log('Headers de requisição:', request.headers);
          return request;
        });
        
        const response = await SalesCampaignService.fetchCampaigns();
        console.log('Resposta da API:', response);
        
        // Remova o interceptor após o uso
        apiProvider.axios.interceptors.request.eject(interceptor);
        
        if (Array.isArray(response)) {
          campaigns.value = response.map((item: any) => {
            console.log('Processando item:', item);
            
            // Mapear dados com os campos corretos da API
            return {
              code: item.code || item.id || Math.floor(Math.random() * 1000), // Gerar código se não existir
              name: item.name || 'Campanha sem nome',
              revenue: parseFloat(item.faturamento || item.revenue || 0), // Use faturamento ou revenue
              goal: parseFloat(item.meta || item.goal || 0), // Use meta ou goal
              hasProducts: true,
              startDate: item.startDate || item.dtInicio,
              endDate: item.endDate || item.dtFinal
            };
          });
          
          console.log('Campanhas após processamento:', campaigns.value);
          
          // Verifique as opções do gráfico após dados serem carregados
          await nextTick();
          console.log('Categorias do gráfico:', campaigns.value.map(c => c.name));
          console.log('Valores de revenue:', campaigns.value.map(c => c.revenue));
          console.log('Valores de goal:', campaigns.value.map(c => c.goal));
        } else {
          console.error('Resposta da API inválida:', response);
          throw new Error('Formato de resposta inválido');
        }
        
      } catch (error) {
        console.error('Erro detalhado:', error);
        $q.notify({
          message: 'Erro ao carregar campanhas. Verifique o console para detalhes.',
          color: 'negative',
          position: 'top'
        });
        
        // Se falhar ao carregar do backend, use dados mockados para não bloquear o usuário
        if (campaigns.value.length === 0) {
          console.log('Usando dados mockados como fallback após erro');
          campaigns.value = mockCampaigns;
          
          // Verifique as opções do gráfico após dados de fallback serem carregados
          await nextTick();
          console.log('(Fallback) Categorias do gráfico:', campaigns.value.map(c => c.name));
          console.log('(Fallback) Valores de revenue:', campaigns.value.map(c => c.revenue));
          console.log('(Fallback) Valores de goal:', campaigns.value.map(c => c.goal));
        }
      } finally {
        loading.value = false;
      }
    };

    // Carregar vendedores para uma campanha
    const loadCampaignSellers = async (campaignId: number) => {
      try {
        loadingSellers.value = true;
        console.log(`Carregando vendedores para campanha ID ${campaignId}`);
        
        if (useMockData.value) {
          console.log('Usando dados mockados de vendedores');
          // Use dados específicos da campanha se existirem, ou os dados default
          sellers.value = mockSellers[campaignId as keyof typeof mockSellers] || mockSellers.default || [];
          setTimeout(() => {
            loadingSellers.value = false;
          }, 500);
          return;
        }
        
        const response = await SalesCampaignService.getCampaignVendors(campaignId);
        console.log('Resposta de vendedores detalhada:', JSON.stringify(response));
        
        if (Array.isArray(response) && response.length > 0) {
          sellers.value = response.map((item: any) => ({
            id: item.vendorId || item.id || 0,
            name: item.vendorName || item.name || `Vendedor ${item.vendorId || item.id || 0}`,
            revenue: parseFloat(item.revenue || item.faturamento || 0),
            goal: parseFloat(item.targetValue || item.meta || 0)
          }));
        } else {
          // Se não houver dados do backend ou a resposta for vazia,
          // use dados mockados específicos ou dados default
          console.log('Usando dados mockados de vendedores como fallback (resposta vazia ou inválida)');
          sellers.value = mockSellers[campaignId as keyof typeof mockSellers] || mockSellers.default || [];
        }
        
        console.log('Vendedores processados:', sellers.value);
        
      } catch (error) {
        console.error('Erro ao carregar vendedores:', error);
        $q.notify({
          message: 'Erro ao carregar vendedores da campanha',
          color: 'negative'
        });
        
        // Use mock data como fallback
        console.log('Usando dados mockados de vendedores como fallback (após erro)');
        sellers.value = mockSellers[campaignId as keyof typeof mockSellers] || mockSellers.default || [];
        
      } finally {
        loadingSellers.value = false;
      }
    };

    // Carregar produtos de uma campanha
    const loadCampaignProducts = async (campaignId: number) => {
      try {
        loadingProducts.value = true;
        console.log(`Carregando produtos para campanha ID ${campaignId}`);
        
        if (useMockData.value) {
          console.log('Usando dados mockados de produtos');
          campaignProducts.value = mockProducts[campaignId as keyof typeof mockProducts] || mockProducts.default || [];
          hasProducts.value = campaignProducts.value.length > 0;
          setTimeout(() => {
            loadingProducts.value = false;
          }, 500);
          return;
        }
        
        const response = await SalesCampaignService.getCampaignProducts(campaignId);
        console.log('Resposta de produtos:', response);
        
        if (Array.isArray(response) && response.length > 0) {
          campaignProducts.value = response.map((item: any) => ({
            productCode: item.productCode || item.code || 0,
            productName: item.productName || item.name || `Produto ${item.productCode || item.code || 0}`,
            quantity: parseFloat(item.quantity || 0),
            unitValue: parseFloat(item.unitValue || 0),
            totalValue: parseFloat(item.totalValue || 0),
            campaignCode: campaignId
          }));
        } else {
          console.log('Usando dados mockados de produtos como fallback (resposta vazia ou inválida)');
          campaignProducts.value = mockProducts[campaignId as keyof typeof mockProducts] || mockProducts.default || [];
        }
        
        hasProducts.value = campaignProducts.value.length > 0;
        console.log('Produtos processados:', campaignProducts.value);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        $q.notify({
          message: 'Erro ao carregar produtos da campanha',
          color: 'negative'
        });
        
        // Use mock data como fallback
        console.log('Usando dados mockados de produtos como fallback (após erro)');
        campaignProducts.value = mockProducts[campaignId as keyof typeof mockProducts] || mockProducts.default || [];
        hasProducts.value = campaignProducts.value.length > 0;
      } finally {
        loadingProducts.value = false;
      }
    };

    // Carregar vendedores de um produto específico
    const loadProductVendors = async (campaignId: number, productId: number) => {
      try {
        loadingProductVendors.value = true;
        console.log(`Carregando vendedores para produto ID ${productId} na campanha ${campaignId}`);
        
        if (useMockData.value) {
          console.log('Usando dados mockados de vendedores por produto');
          productVendors.value = mockProductVendors[productId as keyof typeof mockProductVendors] || mockProductVendors.default || [];
          setTimeout(() => {
            loadingProductVendors.value = false;
          }, 500);
          return;
        }
        
        const response = await SalesCampaignService.getProductVendors(campaignId, productId);
        console.log('Resposta de vendedores por produto:', response);
        
        if (Array.isArray(response) && response.length > 0) {
          productVendors.value = response.map((item: any) => ({
            vendorId: item.vendorId || 0,
            vendorName: item.vendorName || `Vendedor ${item.vendorId || 0}`,
            sales: parseFloat(item.sales || 0),
            goal: parseFloat(item.targetValue || item.meta || 0)
          }));
        } else {
          console.log('Usando dados mockados de vendedores por produto como fallback (resposta vazia ou inválida)');
          productVendors.value = mockProductVendors[productId as keyof typeof mockProductVendors] || mockProductVendors.default || [];
        }
        
        console.log('Vendedores por produto processados:', productVendors.value);
      } catch (error) {
        console.error('Erro ao carregar vendedores do produto:', error);
        $q.notify({
          message: 'Erro ao carregar dados de vendedores por produto',
          color: 'negative'
        });
        
        // Use mock data como fallback
        console.log('Usando dados mockados de vendedores por produto como fallback (após erro)');
        productVendors.value = mockProductVendors[productId as keyof typeof mockProductVendors] || mockProductVendors.default || [];
      } finally {
        loadingProductVendors.value = false;
      }
    };

    // Carregar dados iniciais
    onMounted(() => {
      // Verificar tenant ID
      const tenantId = localStorage.getItem('tenantId');
      if (!tenantId) {
        console.warn('Tenant ID não encontrado no localStorage. Usando valor padrão.');
        localStorage.setItem('tenantId', 'candy'); // Defina um valor padrão
        $q.notify({
          message: 'Utilizando tenant padrão "candy"',
          color: 'warning',
          position: 'top'
        });
      }
      
      // Simples verificação para debug: inicialize com dados mockados
      useMockData.value = !tenantId || window.location.search.includes('mock=true');
      
      loadCampaigns();
    });

    // Valor máximo para a escala das barras de produtos
    const maxValue = computed(() => {
      if (!campaignProducts.value.length) return 500;

      let max = 0;
      campaignProducts.value.forEach(product => {
        max = Math.max(max, product.quantity, product.unitValue);
      });

      // Arredonda para cima para um múltiplo de 100
      return Math.ceil(max / 100) * 100;
    });

    // Opções do gráfico de campanhas
    const campaignChartOptions = computed(() => ({
      chart: {
        id: 'campaigns-chart',
        toolbar: {
          show: false
        },
        animations: {
          enabled: true
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '45%',
          endingShape: 'flat'
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: campaigns.value.map(c => c.name || ''),
        labels: {
          rotate: -40,
          rotateAlways: true,
          hideOverlappingLabels: false,
          style: {
            fontSize: '12px',
            fontWeight: 400
          }
        }
      },
      yaxis: {
        title: {
          text: ''
        },
        labels: {
          formatter: function (value: number) {
            return value >= 1000 ? (value / 1000) + 'K' : value;
          }
        },
        min: 0
      },
      grid: {
        padding: {
          bottom: 10
        }
      },
      fill: {
        opacity: 1
      },
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
    }));

    // Dados do gráfico de campanhas
    const campaignChartSeries = computed(() => {
      // Verifique se os dados são válidos antes de retornar
      const validData = campaigns.value.length > 0;
      if (!validData) {
        console.warn('Dados de campanhas inválidos para o gráfico:', campaigns.value);
      }
      
      return [
        {
          name: 'Faturamento',
          data: campaigns.value.map(c => c.revenue || 0)
        },
        {
          name: 'Meta',
          data: campaigns.value.map(c => c.goal || 0)
        }
      ];
    });

    // Opções do gráfico de vendedores
    const sellerChartOptions = computed(() => {
      if (!selectedCampaign.value) return {};

      return {
        chart: {
          id: 'sellers-chart',
          toolbar: {
            show: false
          },
          animations: {
            enabled: true
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '45%',
            endingShape: 'flat'
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: sellers.value.map(s => s.name || ''),
          labels: {
            rotate: -40,
            rotateAlways: true,
            hideOverlappingLabels: false,
            style: {
              fontSize: '12px'
            }
          }
        },
        yaxis: {
          title: {
            text: ''
          },
          labels: {
            formatter: function (value: number) {
              return value >= 1000 ? (value / 1000) + 'K' : value;
            }
          },
          min: 0
        },
        fill: {
          opacity: 1
        },
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

      // Verifique se os dados de vendedores são válidos
      const validData = sellers.value.length > 0;
      if (!validData) {
        console.warn('Dados de vendedores inválidos para o gráfico:', sellers.value);
      }

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

    // Opções do gráfico de produtos por vendedor
    const productVendorChartOptions = computed(() => {
      if (!selectedProduct.value) return {};

      // Encontra o valor máximo para o eixo Y
      let maxYValue = 0;
      productVendors.value.forEach(pv => {
        maxYValue = Math.max(maxYValue, pv.sales, pv.goal);
      });
      // Adiciona um buffer de 10% para o valor máximo
      maxYValue = Math.ceil(maxYValue * 1.1) || 10; // Valor mínimo de 10 se maxYValue for 0

      return {
        chart: {
          id: 'product-vendor-chart',
          toolbar: {
            show: false
          },
          animations: {
            enabled: true
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '45%',
            endingShape: 'flat'
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: productVendors.value.map(pv => pv.vendorName || ''),
          labels: {
            rotate: -40,
            rotateAlways: true,
            hideOverlappingLabels: false,
            style: {
              fontSize: '12px',
              fontWeight: 400
            }
          }
        },
        yaxis: {
          title: {
            text: ''
          },
          labels: {
            formatter: function (value: number) {
              return value.toString();
            }
          },
          min: 0,
          max: maxYValue
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (value: number) {
              return value + ' UN';
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

    // Dados do gráfico de produtos por vendedor
    const productVendorChartSeries = computed(() => {
      if (!selectedProduct.value) return [];

      return [
        {
          name: 'Vendas',
          data: productVendors.value.map(pv => pv.sales || 0)
        },
        {
          name: 'Meta',
          data: productVendors.value.map(pv => pv.goal || 0)
        }
      ];
    });

    // Função para lidar com clique no gráfico de campanhas
    const handleCampaignClick = (event: any, chartContext: any, config: { dataPointIndex: undefined }) => {
      if (config.dataPointIndex !== undefined) {
        const campaignIndex = config.dataPointIndex;
        if (campaignIndex >= 0 && campaignIndex < campaigns.value.length) {
          selectedCampaign.value = campaigns.value[campaignIndex];
          console.log('Campanha selecionada:', selectedCampaign.value);
          
          // Definir hasProducts como true inicialmente
          hasProducts.value = true;
          
          // Carregar dados para a campanha selecionada
          loadCampaignSellers(selectedCampaign.value.code);
          loadCampaignProducts(selectedCampaign.value.code);
          
          selectedSeller.value = null;
          selectedProduct.value = null;
          
          console.log('Estado após clique em campanha:', {
            selectedCampaign: selectedCampaign.value,
            hasProducts: hasProducts.value
          });
        }
      }
    };

    // Função para lidar com clique no gráfico de vendedores
    const handleSellerClick = (event: any, chartContext: any, config: { dataPointIndex: undefined }) => {
      if (!selectedCampaign.value || config.dataPointIndex === undefined) return;

      const sellerIndex = config.dataPointIndex;
      if (sellerIndex >= 0 && sellerIndex < sellers.value.length) {
        selectedSeller.value = sellers.value[sellerIndex];
        console.log('Vendedor selecionado:', selectedSeller.value);
        
        // Aqui você pode adicionar lógica para carregar dados específicos do vendedor
        // Por exemplo, pedidos do vendedor nesta campanha
      }
    };

    // Função para lidar com clique em um produto
    const handleProductClick = (product: Product) => {
      selectedProduct.value = product;
      console.log('Produto selecionado:', selectedProduct.value);
      
      // Carregar vendedores do produto selecionado
      if (selectedCampaign.value) {
        loadProductVendors(selectedCampaign.value.code, product.productCode);
      }
    };

    // Função auxiliar para formatar datas
    function formatDate(dateStr: string) {
      if (!dateStr) return '';
      // Verificar se já está no formato esperado pelo backend (pode precisar ajustar)
      if (dateStr.includes('-')) {
        return dateStr;
      }
      // Caso contrário, converter para o formato esperado
      const parts = dateStr.split('/');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // Função para exibir o modal de criação de campanha
    const createCampaign = () => {
      newCampaign.value = {
        name: '',
        dtInicio: '',
        dtFinal: '',
        fgAtivo: 1,
        vlCampanha: 0,
        qtPositivacao: 0,
        vlBonus: 0
      };
      showNewCampaignDialog.value = true;
    };

    // Função para salvar nova campanha
    const saveCampaign = async () => {
      try {
        saving.value = true;
        console.log('Dados enviados:', newCampaign.value);
        
        // Verifique se campos obrigatórios estão preenchidos
        if (!newCampaign.value.name || !newCampaign.value.dtInicio || !newCampaign.value.dtFinal) {
          throw new Error('Campos obrigatórios não preenchidos');
        }
        
        // Formate as datas corretamente se necessário
        const formattedCampaign = {
          ...newCampaign.value,
          // Converter para o formato esperado pelo backend
          dtInicio: formatDate(newCampaign.value.dtInicio),
          dtFinal: formatDate(newCampaign.value.dtFinal)
        };
        
        // Se estiver usando dados mockados, simule sucesso
        if (useMockData.value) {
          console.log('Simulando criação de campanha com dados mockados');
          
          // Adicionar à lista local com ID gerado
          const newId = Math.max(...campaigns.value.map(c => c.code), 0) + 1;
          campaigns.value.push({
            code: newId,
            name: formattedCampaign.name,
            revenue: 0,
            goal: formattedCampaign.vlCampanha,
            hasProducts: false,
            startDate: formattedCampaign.dtInicio,
            endDate: formattedCampaign.dtFinal
          });
          
          await new Promise(resolve => setTimeout(resolve, 500)); // Simular atraso
          
          $q.notify({
            message: 'Campanha criada com sucesso (modo teste)',
            color: 'positive'
          });
          
          showNewCampaignDialog.value = false;
          return;
        }
        
        const response = await SalesCampaignService.createCampaign(formattedCampaign);
        console.log('Resposta do servidor:', response);
        
        $q.notify({
          message: 'Campanha criada com sucesso',
          color: 'positive'
        });
        
        // Recarregar dados
        await loadCampaigns();
        showNewCampaignDialog.value = false;
      } catch (error: any) {
        console.error('Erro ao criar campanha:', error);
        console.log('Detalhes do erro:', error.response?.data || error.message);
        
        $q.notify({
          message: `Erro ao criar campanha: ${error.response?.data?.message || error.message}`,
          color: 'negative'
        });
      } finally {
        saving.value = false;
      }
    };

    return {
      // Dados
      campaigns,
      selectedCampaign,
      selectedSeller,
      selectedProduct,
      hasProducts,
      campaignProducts,
      sellers,
      productVendors,
      loading,
      loadingSellers,
      loadingProducts,
      loadingProductVendors,
      showNewCampaignDialog,
      newCampaign,
      saving,
      useMockData,
      
      // Propriedades computadas
      maxValue,
      campaignChartOptions,
      campaignChartSeries,
      sellerChartOptions,
      sellerChartSeries,
      productVendorChartOptions,
      productVendorChartSeries,
      
      // Métodos
      handleCampaignClick,
      handleSellerClick,
      handleProductClick,
      createCampaign,
      saveCampaign
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

// Estilos para o modal de nova campanha
.q-dialog {
  .q-card {
    min-width: 380px;
    max-width: 600px;
    padding: 16px;
  }

  .q-card-section {
    padding: 12px 0;
  }

  .q-input {
    margin-bottom: 16px;

    // Garantir que os labels não se sobreponham
    .q-field__label {
      transform: translateY(-100%) scale(0.75);
      transform-origin: left top;
    }

    // Espaçamento para inputs com duas colunas
    &.half-width {
      width: calc(50% - 8px);
      display: inline-block;
    }

    &.half-width:first-child {
      margin-right: 16px;
    }
  }

  // Layout de duas colunas para datas e valores
  .row-inputs {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .q-toggle {
    margin-top: 16px;
  }

  .q-card-actions {
    padding: 16px 0 0;
  }
}

// Responsividade para dispositivos menores
@media (max-width: 480px) {
  .product-name {
    display: block;
    margin-top: 5px;
  }

  .q-dialog .q-card {
    min-width: 95%;
    max-width: 95%;
    margin: 0 auto;

    .row-inputs {
      flex-direction: column;
    }

    

    .q-input.half-width {
      width: 100%;
      margin-right: 0 !important;
      margin-bottom: 16px;
    }
  }
}

// Estilos adicionais para consistência
.q-card-section {
  &:first-child {
    padding-bottom: 0;
  }
  &:last-child {
    padding-top: 0;
  }

  
}
</style>