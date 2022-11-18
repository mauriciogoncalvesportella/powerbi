<template>
  <chart-base
    title="Faturamento Diário Vendedores"
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
        label="Alternar para Acumulado"
        class="full-width"
        icon="signal_cellular_alt"
        unelevated
        @click="toAccumulated"
      />
      <seller-list-api
        v-if="cds.length > 1"
        :cds="cds"
        :year-month-array="[idMesAno]"
        @filter="nextStateSellers"
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
import { format } from 'date-fns'
import { NumberUtils } from 'src/utils/number.utils'
import { DateUtils } from 'src/utils/date.utils'
import { RevenueDTO } from 'src/store/sales/revenue/revenue.types'
import { ptBR } from 'date-fns/locale'
import OrderTableDialog from 'src/components/sales/OrderTableDialog.vue'
import SellerListApi from 'src/components/sales/SellerListApi.vue'
import RevenueMixin from './RevenueMixin'
import YearMonthChip from 'src/components/YearMonthChip.vue'

class Props {
  readonly cds!: number[];
  readonly idMesAno!: string;
  readonly stateCount = prop<number>({ default: 0 })
}

@Options({
  components: {
    ChartBase,
    SellerListApi,
    YearMonthChip,
    OrderTableDialog
  },
  mixins: [RevenueMixin]
})
export default class RevenueSellers extends Vue.with(Props) {
  loading = true
  noData = true
  error = ''
  chartData: RevenueDTO = {
    values: [],
    goalValues: [],
    goal: 0,
    dates: [],
    meta: {}
  }

  tableParams = {
    init: '' as string,
    end: '' as string,
    cds: [] as number[]
  }

  get dateLabel () {
    return format(new Date(`${this.idMesAno}-01 00:00`), 'MMMM - yyyy', { locale: ptBR })
  }

  get sellersMap () {
    return this.$store.state.sales.sellersMap ?? new Map()
  }

  getSellerName (cd: number) {
    return this.sellersMap.get(cd)?.nmVendedor ?? 'Erro'
  }

  nextMenu (event: any, chartcontext: any, { dataPointIndex }: { dataPointIndex: number }) {
    if (this.cds.length === 1) {
      const date = format(this.chartData.dates[dataPointIndex], 'yyyy-MM-dd')
      // const { init } = DateUtils.dateLimits1(this.idMesAno, dataPointIndex + 1, dataPointIndex + 1)
      // @ts-ignore
      this.$refs.OrderTableDialog.open(this.cds[0], null, date)
    } else {
      const date = this.chartData.dates[dataPointIndex]
      this.$emit('nextState', {
        component: 'RevenueSellersMonthly',
        props: {
          cds: this.cds,
          idMesAno: this.idMesAno,
          initDay: date,
          endDay: date
        }
      })
    }
  }

  toAccumulated () {
    this.$emit('nextState', {
      component: 'RevenueSellersAccumulated',
      props: {
        cds: this.cds,
        idMesAno: this.idMesAno
      }
    })
  }

  nextStateSellers (cds: number[]) {
    this.$emit('nextState', {
      component: 'RevenueSellers',
      props: {
        cds,
        idMesAno: this.idMesAno
      }
    })
  }

  chart = {
    options: {
      labels: {},
      chart: {
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      tooltip: {
        x: {
          formatter: DateUtils.date2DayAndWeekday
        },
        y: {
          formatter: NumberUtils.number2currency
        }
      },
      stroke: {
        width: [0, 3]
      },
      yaxis: {
        labels: {
          formatter: NumberUtils.number2thousand
        }
      },
      xaxis: {
        tooltip: {
          enabled: false
        },
        // tickAmount: 0,
        type: 'datetime',
        labels: {
          formatter: function (value: number): string {
            return format(new Date(value), 'dd')
          }
        }
      },
      dataLabels: {
        enabled: false
      }
    },
    series: [
      {
        type: 'bar',
        name: 'Faturamento Geral',
        data: [30, 40, 45, 50, 49, 60, 70, 91]
      }
    ]
  }

  /*
  dataPointSelection (event: any, chartcontext: any, config: any) {
  }
  */

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
      goal: 0,
      dates: [],
      meta: {}
    }

    this.tableParams = {
      init: '' as string,
      end: '' as string,
      cds: [] as number[]
    }

    await this.getData()
  }

  async getData () {
    try {
      this.loading = true
      this.noData = false
      this.error = ''
      this.chartData = await this.$store.dispatch('sales/faturamento/dailySellers', {
        idMesAno: this.idMesAno,
        cds: this.cds
      })

      if (this.chartData.dates.length) {
        this.chart.options.labels = this.chartData.dates
        // this.chart.options.xaxis.tickAmount = data.dates.length
        this.chart.series = [{
          type: 'bar',
          name: 'Faturamento Diário',
          data: this.chartData.values
        }, {
          type: 'line',
          name: 'Meta Diária',
          data: this.chartData.goalValues
        }]
      } else {
        this.noData = true
      }
    } catch (err) {
      this.error = `Erro ${err?.response?.status ?? 'interno'}`
    } finally {
      this.loading = false
    }
  }
}
</script>
