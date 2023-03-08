<template>
  <chart-base
    ref="chartBase"
    title="Faturamento Mensal Acumulado"
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
      <team-list-api
        :cds="cds"
        :year-month-array="[idMesAno]"
        @filter-by-teams="nextStateTeams"
        @filter-by-sellers="nextStateSellers"
      />
    </template>
    <template
      v-slot:header
    >
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
            icon="groups"
          >
            {{ getTeamName(cd) }}
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
import TeamListApi from 'src/components/sales/TeamListApi.vue'
import SellerList from 'src/components/sales/SellerList.vue'
import YearMonthChip from 'src/components/YearMonthChip.vue'
import RevenueMixin from './RevenueMixin'
const ptBr = require('apexcharts/dist/locales/pt-br.json')

class Props {
  readonly cds!: number[];
  readonly idMesAno!: string;
  readonly stateCount = prop<number>({ default: 0 })
}

@Options({
  components: {
    ChartBase,
    TeamListApi,
    SellerList,
    YearMonthChip
  },
  mixins: [RevenueMixin]
})
export default class RevenueTeamAccumulated extends Vue.with(Props) {
  loading = true
  noData = true
  pointIndex: number = -1
  chartData?: RevenueDTO = undefined
  teamsLeaf: { [id: number]: boolean } = {}
  error = ''

  get isLeafTeam () {
    return this.$store.state.sales.isLeafTeam
  }

  get teamsMap () {
    return this.$store.state.sales.teamsMap ?? new Map()
  }

  get dateLabel () {
    return format(new Date(`${this.idMesAno}-01 00:00`), 'MMMM - yyyy', { locale: ptBR })
  }

  nextStateTeams (cds: number[]) {
    this.$emit('nextState', {
      component: 'RevenueTeamAccumulated',
      props: {
        cds,
        idMesAno: this.idMesAno
      }
    })
  }

  nextStateSellers (cds: number[]) {
    this.$emit('nextState', {
      component: 'RevenueSellersAccumulated',
      props: {
        cds,
        idMesAno: this.idMesAno
      }
    })
  }

  getTeamName (cd: number) {
    return this.teamsMap.get(cd)?.nmEquipe ?? 'leonardo'
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
      type: 'bar',
      name: 'Faturamento Geral',
      data: [30, 40, 45, 50, 49, 60, 70, 91]
    }]
  }

  toDaily () {
    this.$emit('nextState', {
      component: 'RevenueTeam',
      props: {
        cds: this.cds,
        idMesAno: this.idMesAno
      }
    })
  }

  nextMenu (event: any, chartcontext: any, { dataPointIndex }: any) {
    this.pointIndex = dataPointIndex
    if (this.chartData) {
      const initDay = this.chartData?.dates[0]
      const endDay = set(this.chartData?.dates[dataPointIndex], {
        hours: 23,
        minutes: 59,
        seconds: 59
      }).getTime()

      this.$emit('nextState', {
        component: 'RevenueTeamMonthly',
        props: {
          cds: (this.cds.length > 1) ? this.cds : null,
          teamCode: (this.cds.length === 1) ? this.cds[0] : null,
          idMesAno: this.idMesAno,
          initDay,
          endDay
        }
      })
    }
  }

  backMenu () {
    // @ts-ignore
    this.$refs.chartBase?.nextMenu = false
  }

  mounted () {
    this.getData()
  }

  async updateProps () {
    this.loading = true
    this.noData = true
    this.pointIndex = -1
    this.chartData = undefined
    this.teamsLeaf = {}
    this.error = ''
    await this.getData()
  }

  async getData () {
    try {
      this.loading = true
      this.noData = false
      this.error = ''
      this.chartData = await this.$store.dispatch('sales/faturamento/dailyAccumulated', {
        idMesAno: this.idMesAno,
        cds: this.cds
      })

      if (this.chartData?.values?.length && this.chartData?.meta?.teamsLeaf) {
        this.teamsLeaf = this.chartData.meta.teamsLeaf
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
    } catch (err: any) {
      console.error(err)
      this.error = `Erro ${err?.response?.status ?? 'interno'}`
    } finally {
      this.loading = false
    }
  }
}
</script>
