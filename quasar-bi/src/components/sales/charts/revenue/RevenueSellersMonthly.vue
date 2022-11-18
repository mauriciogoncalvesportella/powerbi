<template>
  <chart-base
    title="Faturamento Mensal Vendedores"
    :apex-options="chart.options"
    :apex-series="chart.series"
    :loading="loading"
    :no-data="noData"
    :error="error"
    :state-count="stateCount"
    filter-disabled
    @data-point-selection="openDialog"
  >
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
            v-if="!initDay || !endDay"
            :year-month="idMesAno"
            commit="sales/faturamento/setYearMonth"
          />
          <q-chip
            v-else
            icon="event"
            size="11.5px"
            :label="dateLabel"
          />
        </div>
      </q-scroll-area>
    </template>
  </chart-base>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component'
import ChartBase from 'components/ChartBase.vue'
import { NumberUtils } from 'src/utils/number.utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import OrderTableDialog from 'src/components/sales/OrderTableDialog.vue'
import YearMonthChip from 'src/components/YearMonthChip.vue'
import RevenueMixin from './RevenueMixin'

class Props {
  readonly cds!: number[];
  readonly idMesAno!: string;
  readonly initDay!: number;
  readonly endDay!: number;
  readonly stateCount = prop<number>({ default: 0 })
}

@Options({
  components: {
    ChartBase,
    OrderTableDialog,
    YearMonthChip
  },
  mixins: [RevenueMixin]
})
export default class RevenueTeamMonthly extends Vue.with(Props) {
  loading = true
  noData = true
  error = ''
  data: any = {}

  get dateLabel () {
    if (this.initDay && this.endDay) {
      if (this.initDay === this.endDay) {
        // return format(new Date(`${this.idMesAno}-${this.initDay} 00:00`), 'dd/MM/yyyy')
        return format(this.initDay, 'dd/MM/yyyy')
      }
      // const init = format(new Date(`${this.idMesAno}-${this.initDay} 00:00`), 'dd/MM/yyyy')
      // const end = format(new Date(`${this.idMesAno}-${this.endDay} 00:00`), 'dd/MM/yyyy')
      const init = format(this.initDay, 'dd/MM/yyyy')
      const end = format(this.endDay, 'dd/MM/yyyy')
      return `de ${init} até ${end}`
    }
    return format(new Date(`${this.idMesAno}-01 00:00`), 'MMMM - yyyy', { locale: ptBR })
  }

  chart = {
    series: [{
      name: 'Net Profit',
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
    }, {
      name: 'Test',
      data: [10, 20, 30, 15, 10, 20, 30, 40, 46]
    }],
    options: {
      chart: {
        type: 'bar'
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        labels: {
          trim: true
        }
      },
      yaxis: {
        labels: {
          formatter: function (value: number): string {
            return NumberUtils.number2thousand(value)
          }
        }
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        enabled: true,
        intersect: false,
        shared: true,
        y: {
          formatter: NumberUtils.number2currency
        }
      }
    }
  }

  openDialog (event: any, chartContext: any, { dataPointIndex }: any) {
    const index = dataPointIndex as number
    const sellerCode = this.data.cds[index] as number
    if (sellerCode !== null) {
      let init: string, end: string
      if (this.initDay && this.endDay) {
        init = format(this.initDay, 'yyyy-MM-dd')
        end = format(this.initDay, 'yyyy-MM-dd')
      }
      // @ts-ignore
      this.$refs.OrderTableDialog.open([sellerCode], this.idMesAno, init, end)
    }
  }

  mounted () {
    this.getData()
  }

  async updateProps () {
    this.loading = true
    this.noData = true
    this.error = ''
    this.data = {}
    await this.getData()
  }

  async getData () {
    try {
      this.loading = true
      this.noData = false
      this.error = ''
      this.data = await this.$store.dispatch('sales/faturamento/monthlySellers', {
        idMesAno: this.idMesAno,
        cds: this.cds,
        initDay: this.initDay,
        endDay: this.endDay
      })
      this.chart.options.xaxis.categories = this.data.labels
      this.chart.series = [{
        name: 'realizado',
        data: this.data.values
      },
      {
        name: 'Meta',
        data: this.data.goalValues
      }]
    } catch (err: any) {
      console.error(err)
      this.error = `Erro ${err?.response?.status ?? 'interno'}`
    } finally {
      this.loading = false
    }
  }
}
</script>
