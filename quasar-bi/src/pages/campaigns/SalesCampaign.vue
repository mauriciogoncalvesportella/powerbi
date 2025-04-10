<!-- eslint-disable vue/no-unused-vars -->
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
                <!-- <q-btn flat round icon="more_vert" color="white" /> -->
              </div>
            </q-card-section>

            <q-card-section>
              <div class="chart-container">
                <apexchart
                  type="bar"
                  height="400"
                  :options="campaignChartOptions"
                  :series="campaignChartSeries"
                  @click="handleCampaignClick"
                ></apexchart>
                <div v-if="!selectedCampaign" class="">
                  <!-- <div class="text-caption">
                    Ao clicar no gráfico, abrir<br>
                    o gráfico da direita<br>
                    mostrando os vendedores
                  </div> -->
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
                <!-- <q-btn flat round icon="more_vert" color="white" /> -->
              </div>
            </q-card-section>

            <q-card-section>
              <div class="chart-container">
                <apexchart
                  type="bar"
                  height="400"
                  :options="sellerChartOptions"
                  :series="sellerChartSeries"
                  @click="handleSellerClick"
                ></apexchart>
              </div>
              <div class="q-mt-md">
                <div v-if="hasProducts" class="text-caption">
                  Se a campanha tiver produtos (Fat = 0)<br>
                  abrir um novo gráfico mostrando os produtos<br>
                  com qtde e meta
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
      <div v-if="selectedCampaign" class="row q-col-gutter-md q-mt-md">
        <!-- Gráfico 3: Gráfico de Produtos Total / ou por vendedor -->
        <div :class="selectedProduct ? 'col-12 col-md-6' : 'col-12'">
          <q-card class="campaign-card">
            <q-card-section class="bg-primary text-white header-section">
              <div class="text-h6">Gráfico de Produtos Total / ou por vendedor</div>
              <div>
                <q-btn flat round icon="arrow_back" color="white" @click="selectedProduct = null" />
                <!-- <q-btn flat round icon="more_vert" color="white" /> -->
              </div>
            </q-card-section>

            <q-card-section>
              <div class="total-products-container">
                <div v-for="(product, index) in campaignProducts" :key="product.id" class="product-bar q-mb-md" @click="handleProductClick(product)">
                  <div class="product-info">
                    <div class="product-code">{{ product.code }}</div>
                    <div class="product-name">{{ product.name }}</div>
                  </div>
                  <div class="product-bars">
                    <div class="bar-container">
                      <div class="bar-label">Venda: {{ product.sales }} UN</div>
                      <q-linear-progress :value="product.sales / maxValue" color="primary" class="q-mt-xs" style="height: 20px;" />
                    </div>
                    <div class="bar-container q-mt-sm">
                      <div class="bar-label">Meta: {{ product.goal }} UN</div>
                      <q-linear-progress :value="product.goal / maxValue" color="green" class="q-mt-xs" style="height: 20px;" />
                    </div>
                  </div>
                </div>

                <div class="product-instructions q-mt-lg">
                  <div class="text-caption">
                    Quando clicar no produto, montar o gráfico ao lado com os vendedores
                  </div>
                  <div class="text-caption q-mt-md">
                    A escala será sempre limitada ao número maior<br>
                    Meta ou realizado
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
                <!-- <q-btn flat round icon="more_vert" color="white" /> -->
              </div>
            </q-card-section>

            <q-card-section>
              <div class="chart-container">
                <apexchart
                  type="bar"
                  height="400"
                  :options="productVendorChartOptions"
                  :series="productVendorChartSeries"
                ></apexchart>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Botão de Nova Campanha -->
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn color="primary" label="NOVA CAMPANHA" @click="createCampaign" />
      </q-page-sticky>
    </q-page>
  </template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import VueApexCharts from 'vue3-apexcharts'

  interface Campaign {
    id: number
    name: string
    revenue: number
    goal: number
    hasProducts: boolean
  }

  interface Seller {
    id: number
    name: string
    revenue: number
    goal: number
  }

  interface Product {
    id: number
    code: string
    name: string
    sales: number
    goal: number
  }

  interface ProductVendorData {
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
    const selectedCampaign = ref<Campaign | null>(null)
    const selectedSeller = ref<Seller | null>(null)
    const selectedProduct = ref<Product | null>(null)
    const hasProducts = ref(false)

    // Dados mockados para as campanhas
    const campaigns = ref<Campaign[]>([
      { id: 1, name: 'Santo Antonio', revenue: 95000, goal: 98000, hasProducts: true },
      { id: 2, name: 'Fiat', revenue: 82000, goal: 90000, hasProducts: true },
      { id: 3, name: 'Riclan', revenue: 58000, goal: 78000, hasProducts: true }
    ])

    // Dados mockados para os vendedores
    const campaignSellers = ref<Record<number, Seller[]>>({
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
      ]
    })

    // Dados mockados para os produtos por campanha
    const campaignProductsData = ref<Record<number, Product[]>>({
      1: [ // Santo Antonio
        { id: 1, code: '01543', name: 'Bala Gelatina Fini Beijos de Morango 12pcX90g', sales: 263, goal: 346 },
        { id: 2, code: '01544', name: 'Bala Gelatina Fini Dentaduras 12pcX90g', sales: 187, goal: 441 }
      ],
      2: [ // Fiat
        { id: 3, code: '03221', name: 'Produto A 15pcX100g', sales: 210, goal: 280 },
        { id: 4, code: '03222', name: 'Produto B 20pcX150g', sales: 154, goal: 320 }
      ],
      3: [ // Riclan
        { id: 5, code: '05121', name: 'Produto X 10pcX50g', sales: 195, goal: 290 },
        { id: 6, code: '05122', name: 'Produto Y 8pcX40g', sales: 210, goal: 310 }
      ]
    })

    // Dados mockados para o desempenho de produtos por vendedor
    const productVendorData = ref<Record<number, ProductVendorData[]>>({
      1: [ // Produto ID 1 (Bala Gelatina Fini Beijos) - Santo Antonio
        { vendorId: 1, vendorName: 'Iara', sales: 52, goal: 60 },
        { vendorId: 2, vendorName: 'Airton', sales: 36, goal: 56 },
        { vendorId: 3, vendorName: 'Ricardo B.', sales: 38, goal: 80 },
        { vendorId: 4, vendorName: 'Gracieli M.', sales: 28, goal: 48 },
        { vendorId: 5, vendorName: 'Marlon Gals.', sales: 25, goal: 48 },
        { vendorId: 6, vendorName: 'Katia Cav.', sales: 21, goal: 0 },
        { vendorId: 7, vendorName: 'Diogo', sales: 8, goal: 0 }
      ],
      2: [ // Produto ID 2 (Bala Gelatina Fini Dentaduras) - Santo Antonio
        { vendorId: 1, vendorName: 'Iara', sales: 45, goal: 58 },
        { vendorId: 2, vendorName: 'Airton', sales: 32, goal: 52 },
        { vendorId: 3, vendorName: 'Ricardo B.', sales: 34, goal: 72 },
        { vendorId: 4, vendorName: 'Gracieli M.', sales: 24, goal: 42 },
        { vendorId: 5, vendorName: 'Marlon Gals.', sales: 22, goal: 42 },
        { vendorId: 6, vendorName: 'Katia Cav.', sales: 18, goal: 0 },
        { vendorId: 7, vendorName: 'Diogo', sales: 7, goal: 0 }
      ],
      3: [ // Produto ID 3 (Produto A) - Fiat
        { vendorId: 8, vendorName: 'Renata', sales: 48, goal: 55 },
        { vendorId: 9, vendorName: 'Paulo', sales: 42, goal: 50 },
        { vendorId: 10, vendorName: 'Eduardo', sales: 40, goal: 60 },
        { vendorId: 11, vendorName: 'Cristina', sales: 38, goal: 45 },
        { vendorId: 12, vendorName: 'Roberto', sales: 32, goal: 40 },
        { vendorId: 13, vendorName: 'Sandra', sales: 10, goal: 30 }
      ],
      4: [ // Produto ID 4 (Produto B) - Fiat
        { vendorId: 8, vendorName: 'Renata', sales: 35, goal: 70 },
        { vendorId: 9, vendorName: 'Paulo', sales: 30, goal: 65 },
        { vendorId: 10, vendorName: 'Eduardo', sales: 28, goal: 60 },
        { vendorId: 11, vendorName: 'Cristina', sales: 25, goal: 50 },
        { vendorId: 12, vendorName: 'Roberto', sales: 20, goal: 45 },
        { vendorId: 13, vendorName: 'Sandra', sales: 16, goal: 30 }
      ],
      5: [ // Produto ID 5 (Produto X) - Riclan
        { vendorId: 14, vendorName: 'Leonardo', sales: 50, goal: 60 },
        { vendorId: 15, vendorName: 'Carla', sales: 45, goal: 55 },
        { vendorId: 16, vendorName: 'Fernando', sales: 40, goal: 50 },
        { vendorId: 17, vendorName: 'Daniela', sales: 35, goal: 45 },
        { vendorId: 18, vendorName: 'Bruno', sales: 25, goal: 40 }
      ],
      6: [ // Produto ID 6 (Produto Y) - Riclan
        { vendorId: 14, vendorName: 'Leonardo', sales: 55, goal: 65 },
        { vendorId: 15, vendorName: 'Carla', sales: 48, goal: 60 },
        { vendorId: 16, vendorName: 'Fernando', sales: 42, goal: 55 },
        { vendorId: 17, vendorName: 'Daniela', sales: 38, goal: 50 },
        { vendorId: 18, vendorName: 'Bruno', sales: 27, goal: 45 }
      ]
    })

    // Produtos da campanha selecionada
    const campaignProducts = computed(() => {
      if (!selectedCampaign.value) return []
      return campaignProductsData.value[selectedCampaign.value.id] || []
    })

    // Valor máximo para a escala das barras de produtos
    const maxValue = computed(() => {
      if (!campaignProducts.value.length) return 500

      let max = 0
      campaignProducts.value.forEach(product => {
        max = Math.max(max, product.sales, product.goal)
      })

      // Arredonda para cima para um múltiplo de 100
      return Math.ceil(max / 100) * 100
    })

    // Opções do gráfico de campanhas
    const campaignChartOptions = computed(() => ({
      chart: {
        id: 'campaigns-chart',
        toolbar: {
          show: false
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
        categories: campaigns.value.map(c => c.name),
        labels: {
          rotate: -40, // Ângulo mais acentuado para garantir a rotação
          rotateAlways: true, // Força sempre a rotação
          hideOverlappingLabels: false, // Não esconde rótulos sobrepostos
          style: {
            fontSize: '12px',
            fontWeight: 400
          },
          offsetX: 0,
          offsetY: 0
        },
        tickPlacement: 'on', // Posicionamento dos ticks
        axisBorder: {
          show: true
        },
        axisTicks: {
          show: true
        }
      },
      yaxis: {
        title: {
          text: ''
        },
        labels: {
          formatter: function (value: number) {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            return value >= 1000 ? (value / 1000) + 'K' : value
          }
        },
        min: 0,
        max: 120000
      },
      grid: {
        padding: {
          bottom: 10 // Adiciona padding na parte inferior para acomodar os rótulos inclinados
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (value: { toLocaleString: (arg0: string) => string }) {
            return 'R$ ' + value.toLocaleString('pt-BR')
          }
        }
      },
      colors: ['#4682B4', '#2ECC71'],
      legend: {
        position: 'top',
        horizontalAlign: 'center'
      }
    }))

    // Dados do gráfico de campanhas
    const campaignChartSeries = computed(() => [
      {
        name: 'Faturamento',
        data: campaigns.value.map(c => c.revenue)
      },
      {
        name: 'Meta',
        data: campaigns.value.map(c => c.goal)
      }
    ])

    // Opções do gráfico de vendedores
    const sellerChartOptions = computed(() => {
      if (!selectedCampaign.value) return {}

      const sellers = campaignSellers.value[selectedCampaign.value.id] || []

      return {
        chart: {
          id: 'sellers-chart',
          toolbar: {
            show: false
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
          categories: sellers.map(s => s.name),
          labels: {
            rotate: -40,
            rotateAlways: true,
            hideOverlappingLabels: false,
            style: {
              fontSize: '12px'
            },
            offsetX: 0,
            offsetY: 0
          }
        },
        yaxis: {
          title: {
            text: ''
          },
          labels: {
            formatter: function (value: number) {
              // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
              return value >= 1000 ? (value / 1000) + 'K' : value
            }
          },
          min: 0,
          max: 120000
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (value: { toLocaleString: (arg0: string) => string }) {
              return 'R$ ' + value.toLocaleString('pt-BR')
            }
          }
        },
        colors: ['#4682B4', '#2ECC71'],
        legend: {
          position: 'top',
          horizontalAlign: 'center'
        }
      }
    })

    // Dados do gráfico de vendedores
    const sellerChartSeries = computed(() => {
      if (!selectedCampaign.value) return []

      const sellers = campaignSellers.value[selectedCampaign.value.id] || []

      return [
        {
          name: 'Faturamento',
          data: sellers.map(s => s.revenue)
        },
        {
          name: 'Meta',
          data: sellers.map(s => s.goal)
        }
      ]
    })

    // Opções do gráfico de produtos por vendedor
    const productVendorChartOptions = computed(() => {
      if (!selectedProduct.value) return {}

      const productVendors = productVendorData.value[selectedProduct.value.id] || []

      // Encontra o valor máximo para o eixo Y
      let maxYValue = 0
      productVendors.forEach(pv => {
        maxYValue = Math.max(maxYValue, pv.sales, pv.goal)
      })
      // Adiciona um buffer de 10% para o valor máximo
      maxYValue = Math.ceil(maxYValue * 1.1)

      return {
        chart: {
          id: 'product-vendor-chart',
          toolbar: {
            show: false
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
          categories: campaigns.value.map(c => c.name),
          labels: {
            rotate: -40, // Ângulo mais acentuado para garantir a rotação
            rotateAlways: true, // Força sempre a rotação
            hideOverlappingLabels: false, // Não esconde rótulos sobrepostos
            style: {
              fontSize: '12px',
              fontWeight: 400
            },
            offsetX: 0,
            offsetY: 0
          },
          tickPlacement: 'on', // Posicionamento dos ticks
          axisBorder: {
            show: true
          },
          axisTicks: {
            show: true
          }
        },
        yaxis: {
          title: {
            text: ''
          },
          labels: {
            formatter: function (value: { toString: () => any }) {
              return value.toString()
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
            formatter: function (value: string) {
              return value + ' UN'
            }
          }
        },
        colors: ['#4682B4', '#2ECC71'],
        legend: {
          position: 'top',
          horizontalAlign: 'center'
        }
      }
    })

    // Dados do gráfico de produtos por vendedor
    const productVendorChartSeries = computed(() => {
      if (!selectedProduct.value) return []

      const productVendors = productVendorData.value[selectedProduct.value.id] || []

      return [
        {
          name: 'Faturamento',
          data: productVendors.map(pv => pv.sales)
        },
        {
          name: 'Meta',
          data: productVendors.map(pv => pv.goal)
        }
      ]
    })

    // Função para lidar com clique no gráfico de campanhas
    const handleCampaignClick = (event: any, chartContext: any, config: { dataPointIndex: undefined }) => {
      if (config.dataPointIndex !== undefined) {
        const campaignIndex = config.dataPointIndex
        if (campaignIndex >= 0 && campaignIndex < campaigns.value.length) {
          selectedCampaign.value = campaigns.value[campaignIndex]
          hasProducts.value = selectedCampaign.value.hasProducts
          selectedSeller.value = null
          selectedProduct.value = null
        }
      }
    }

    // Função para lidar com clique no gráfico de vendedores
    const handleSellerClick = (event: any, chartContext: any, config: { dataPointIndex: undefined }) => {
      if (!selectedCampaign.value || config.dataPointIndex === undefined) return

      const sellers = campaignSellers.value[selectedCampaign.value.id] || []
      const sellerIndex = config.dataPointIndex

      if (sellerIndex >= 0 && sellerIndex < sellers.length) {
        selectedSeller.value = sellers[sellerIndex]
      }
    }

    // Função para lidar com clique em um produto
    const handleProductClick = (product: Product) => {
      selectedProduct.value = product
    }

    const createCampaign = () => {
      $q.notify({
        message: 'Funcionalidade para criar nova campanha',
        color: 'info'
      })
    }

    return {
      campaignChartOptions,
      campaignChartSeries,
      sellerChartOptions,
      sellerChartSeries,
      productVendorChartOptions,
      productVendorChartSeries,
      selectedCampaign,
      selectedSeller,
      selectedProduct,
      hasProducts,
      campaignProducts,
      maxValue,
      handleCampaignClick,
      handleSellerClick,
      handleProductClick,
      createCampaign
    }
  }
})
</script>

<style lang="sass" scoped>
.campaign-card
  width: 100%
  height: 100%

.header-section
  display: flex
  justify-content: space-between
  align-items: center

.chart-container
  position: relative

.chart-instructions
  position: absolute
  top: 50%
  left: 55%
  transform: translate(-50%, -50%)
  background-color: rgba(255, 255, 255, 0.8)
  padding: 10px
  border-radius: 5px
  text-align: center

.total-products-container
  position: relative
  padding: 0 10px

.product-bar
  cursor: pointer
  margin-bottom: 20px

.product-info
  margin-bottom: 5px

.product-code
  font-weight: bold
  font-size: 14px
  display: inline-block
  margin-right: 10px

.product-name
  font-size: 14px
  display: inline-block

.bar-container
  margin-top: 5px

.bar-label
  font-size: 12px
  margin-bottom: 2px

.product-instructions
  text-align: center
  margin-top: 30px
  font-size: 14px
</style>
