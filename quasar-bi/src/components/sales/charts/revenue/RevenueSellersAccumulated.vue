<template>
  <chart-base
    title="Faturamento Mensal Acumulado Vendedores"
    :apex-options="chart.options"
    :apex-series="chart.series"
    :loading="loading"
    :no-data="noData"
    :error="error"
    :state-count="stateCount"
    @data-point-selection="nextMenu"
  >
    <template
      v-slot:filter
    >
      <q-btn
        label="Alternar para diário"
        class="full-width"
        icon="bar_chart"
        unelevated
        @click="toDaily"
      />
      <seller-list-api
        v-if="cds.length > 1"
        :cds="cds"
        :year-month-array="[idMesAno]"
        @filter="nextState"
      />
    </template>
    <template
      v-slot:header
    >
      <order-table-dialog
        ref="OrderTableDialog"
      />
      <q-scroll-area
        style="height: 38px"
        class="full-width"
        :thumb-style="{ right: '2px', borderRadius: '5px', width: '2px', height: '8px', opacity: .25 }"
      >
        <div
          class="row no-wrap"
        >
          <year-month-chip
            :year-month="idMesAno"
            commit="sales/faturamento/setYearMonth"
          />
          <q-chip
            v-for="cd in cds"
            :key="`v-chip-${cd}`"
            size="11.5px"
            icon="person"
          >
            {{ getSellerName(cd) }}
          </q-chip>
        </div>
      </q-scroll-area>
    </template>
  </chart-base>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component'
import ChartBase from 'components/ChartBase.vue'
import { RevenueDTO } from 'src/store/sales/revenue/revenue.types'
import { format, set } from 'date-fns'
import { NumberUtils } from 'src/utils/number.utils'
import { ptBR } from 'date-fns/locale'
import OrderTableDialog from 'src/components/sales/OrderTableDialog.vue'
import SellerListApi from 'src/components/sales/SellerListApi.vue'
import RevenueMixin from './RevenueMixin'
import YearMonthChip from 'src/components/YearMonthChip.vue'
const ptBr = require('apexcharts/dist/locales/pt-br.json')

class Props {
  readonly cds!: number[];
  readonly idMesAno!: string;
  readonly stateCount = prop<number>({ default: 0 })
}

@Options({
  components: {
    ChartBase,
    SellerListApi,
    OrderTableDialog,
    YearMonthChip
  },
  mixins: [RevenueMixin]
})
export default class RevenueSellersAccumulated extends Vue.with(Props) {
  loading = true
  noData = true
  error = ''
  chartData: RevenueDTO = {
    values: [],
    goalValues: [],
    meta: {},
    dates: [],
    goal: 0
  }

  get dateLabel () {
    return format(new Date(`${this.idMesAno}-01 00:00`), 'MMMM - yyyy', { locale: ptBR })
  }

  get sellersMap () {
    return this.$store.state.sales.sellersMap ?? new Map()
  }

  getSellerName (cd: number) {
    return this.sellersMap.get(cd)?.nmVendedor ?? 'ERRO'
  }

  nextState (cds: number[]) {
    this.$emit('nextState', {
      component: 'RevenueSellersAccumulated',
      props: {
        cds,
        idMesAno: this.idMesAno
      }
    })
  }

  toDaily () {
    this.$emit('nextState', {
      component: 'RevenueSellers',
      props: {
        cds: this.cds,
        idMesAno: this.idMesAno
      }
    })
  }

  nextMenu (event: any, chartcontext: any, { dataPointIndex }: { dataPointIndex: number }) {
    const initDay = this.chartData?.dates[0]
    const endDay = set(this.chartData?.dates[dataPointIndex], {
      hours: 23,
      minutes: 59,
      seconds: 59
    }).getTime()
    // @ts-ignore
    // this.$refs.chartBase?.nextMenu = true

    // Mais de uma equipe vinculada
    if (this.cds.length > 1) {
      this.$emit('nextState', {
        component: 'RevenueSellersMonthly',
        props: {
          cds: this.cds,
          idMesAno: this.idMesAno,
          initDay,
          endDay
        }
      })
    } else {
      const init = format(initDay, 'yyyy-MM-dd')
      const end = format(endDay, 'yyyy-MM-dd')
      // @ts-ignore
      this.$refs.OrderTableDialog.open(this.cds[0], null, init, end)
    }
  }

  chart = {
    options: {
      chart: {
        type: 'line',
        locales: [ptBr],
        defaultLocale: 'pt-br',
        zoom: {
          enabled: false
        }
      },
      tooltip: {
        x: {
          formatter: function (value: number) {
            const date = new Date(value)
            const weekDay = date.toLocaleString('pt-BR', { weekday: 'long' })
            return `${format(value, 'dd')} - ${weekDay}`
          }
        },
        y: {
          formatter: NumberUtils.number2currency
        }
      },
      stroke: {
        width: [0, 3]
      },
      labels: {},
      yaxis: {
        labels: {
          formatter: function (value: number): string {
            return NumberUtils.number2thousand(value)
            // @ts-ignore
            // return value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
          }
        }
      },
      xaxis: {
        tooltip: {
          enabled: false
        },
        type: 'datetime',
        labels: {
          formatter: function (value: number): any {
            return format(value, 'dd')
          }
        }
      }
    },
    series: [{
      type: 'line',
      name: 'Faturamento Geral',
      data: [30, 40, 45, 50, 49, 60, 70, 91]
    }]
  }

  mounted () {
    this.getData()
  }

  async updateProps () {
    this.loading = true
    this.noData = true
    this.error = ''
    this.chartData = {
      values: [],
      goalValues: [],
      meta: {},
      dates: [],
      goal: 0
    }
    await this.getData()
  }

  async getData () {
    try {
      this.loading = true
      this.noData = false
      this.error = ''
      this.chartData = await this.$store.dispatch('sales/faturamento/dailySellersAccumulated', {
        idMesAno: this.idMesAno,
        cds: this.cds
      })

      if (this.chartData.dates.length) {
        this.chart.options.labels = this.chartData.dates
        this.chart.series = [{
          type: 'bar',
          name: 'Faturamento',
          data: this.chartData.values
        }, {
          type: 'line',
          name: 'Meta',
          data: this.chartData.goalValues
        }]
      } else {
        this.noData = true
      }
    } catch (err) {
      console.error(err)
      this.error = `Erro ${err?.response?.status ?? 'interno'}`
    } finally {
      this.loading = false
    }
  }
}
</script>
