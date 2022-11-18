<template>
  <chart-base
    ref="chartBase"
    title="Faturamento Mensal Equipes"
    :apex-options="chart.options"
    :apex-series="chart.series"
    :loading="loading"
    :no-data="noData"
    :error="error"
    :state-count="stateCount"
    filter-disabled
    @data-point-selection="nextMenu"
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
          <q-chip
            v-if="teamCode != undefined"
            size="11.5px"
            icon="groups"
          >
            {{ getTeamName(teamCode) }}
          </q-chip>
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
import RevenueMixin from './RevenueMixin'
import YearMonthChip from 'src/components/YearMonthChip.vue'

class Props {
  readonly cds!: number[];
  readonly teamCode!: number;
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
  chartData = {
    labels: [],
    cds: [],
    types: [],
    values: [],
    goalValues: []
  }

  get dateLabel () {
    if (this.initDay && this.endDay) {
      if (this.initDay === this.endDay) {
        return format(this.initDay, 'dd/MM/yyyy')
      }
      const init = format(this.initDay, 'dd/MM/yyyy')
      const end = format(this.endDay, 'dd/MM/yyyy')
      return `de ${init} até ${end}`
    }
    return format(new Date(`${this.idMesAno}-01 00:00`), 'MMMM - yyyy', { locale: ptBR })
  }

  get teamsMap () {
    return this.$store.state.sales.teamsMap ?? new Map()
  }

  getTeamName (cd: number) {
    return this.teamsMap.get(cd)?.nmEquipe ?? 'Erro'
  }

  error = ''
  chart = {
    series: [{
      name: 'Net Profit',
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
    }, {
      name: 'Revenue',
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
    }, {
      name: 'Free Cash Flow',
      data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
    }],
    options: {
      chart: {
        toolbar: {
          show: false
        },
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        }
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
        followCursor: false,
        y: {
          formatter: NumberUtils.number2currency
        }
      }
    }
  }

  nextMenu (event: any, chartcontext: any, { dataPointIndex }: { dataPointIndex: number }) {
    const cd = this.chartData.cds[dataPointIndex]
    const type = this.chartData.types[dataPointIndex]

    if (cd !== null && type !== null) {
      if (type === 0) { // time
        this.$emit('nextState', {
          component: 'RevenueTeamMonthly',
          props: {
            teamCode: this.chartData.cds[dataPointIndex],
            idMesAno: this.idMesAno,
            initDay: this.initDay,
            endDay: this.endDay
          }
        })
      } else { // seller
        // @ts-ignore
        this.$refs.OrderTableDialog.open(
          cd,
          this.idMesAno,
          this.initDay ? format(this.initDay, 'yyyy-MM-dd') : null,
          this.endDay ? format(this.endDay, 'yyyy-MM-dd') : null
        )
      }
    }
  }

  backMenu () {
    // this.pointIndex = dataPointIndex
    // @ts-ignore
    this.$refs.chartBase?.nextMenu = false
  }

  mounted () {
    this.getData()
  }

  async updateProps () {
    this.loading = true
    this.noData = true
    this.chartData = {
      labels: [],
      cds: [],
      types: [],
      values: [],
      goalValues: []
    }
    await this.getData()
  }

  async getData () {
    try {
      this.loading = true
      this.noData = false
      this.error = ''
      this.chartData = await this.$store.dispatch('sales/faturamento/monthlyTeams', {
        idMesAno: this.idMesAno,
        cds: this.cds,
        teamCode: this.teamCode,
        initDay: this.initDay,
        endDay: this.endDay
      })
      this.chart.options.xaxis.categories = this.chartData?.labels
      this.chart.series = [{
        name: 'realizado',
        data: this.chartData.values
      },
      {
        name: 'Meta',
        data: this.chartData.goalValues
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
