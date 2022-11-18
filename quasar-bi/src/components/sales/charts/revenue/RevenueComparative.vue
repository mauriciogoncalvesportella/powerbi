<template>
  <chart-base
    title="Comparativo entre meses"
    :apex-options="chart.options"
    :apex-series="chart.series"
    :loading="loading"
    :no-data="noData"
    :error="error"
    :state-count="stateCount"
    :filter-disabled="filterDisabled"
  >
    <template
      v-slot:filter
    >
      <team-list-api
        v-if="yearMonthArray?.length > 0 && teamsCode?.length > 0"
        :cds="teamsCode"
        :year-month-array="yearMonthArray"
        @filter-by-teams="nextStateTeams"
        @filter-by-sellers="nextStateSellers"
      />
      <seller-list-api
        v-else-if="yearMonthArray?.length > 0 && sellersCode?.length > 1"
        :cds="sellersCode"
        :year-month-array="yearMonthArray"
        @filter="nextStateSellers"
      />
    </template>
    <template
      v-slot:header
    >
      <q-scroll-area
        v-show="!loading"
        style="height: 38px"
        class="full-width"
        :thumb-style="{ right: '2px', borderRadius: '5px', width: '2px', height: '8px', opacity: .25 }"
      >
        <div
          class="row no-wrap"
        >
          <!--year-month-chip
            :year-month="idMesAno"
            commit="sales/faturamento/setYearMonth"
          /-->
          <year-month-chip
            :year-month="idMesAno"
            @year-month-click="$emit('NextStateYearMonth', $event)"
          />
          <q-chip
            v-for="cd in teamsCode"
            :key="`v-chip-teams-${cd}`"
            size="11.5px"
            icon="groups"
          >
            {{ getTeamName(cd) }}
          </q-chip>
          <q-chip
            v-for="cd in sellersCode"
            :key="`v-chip-sellers-${cd}`"
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
import TeamTree from 'src/components/sales/TeamTree.vue'
import TeamList from 'src/components/sales/TeamList.vue'
import TeamListApi from 'src/components/sales/TeamListApi.vue'
import SellerListApi from 'src/components/sales/SellerListApi.vue'
import SellerList from 'src/components/sales/SellerList.vue'
import { ptBR } from 'date-fns/locale'
import { ComparativeTeamDaily } from 'src/store/sales/revenue/revenue.types'
import YearMonthMixin from 'src/components/sales/charts/mixins/MixinUpdateYearMonth'
import YearMonthChip from 'src/components/YearMonthChip.vue'

class Props {
  readonly teamsCode!: number[];
  readonly sellersCode!: number[];
  readonly idMesAno!: string;
  readonly count!: number;
  readonly accumulated = prop<boolean>({ default: false })
  readonly stateCount = prop<number>({ default: 0 })
}

@Options({
  components: {
    ChartBase,
    TeamTree,
    TeamList,
    TeamListApi,
    SellerList,
    SellerListApi,
    YearMonthChip
  },
  mixins: [YearMonthMixin]
})
export default class RevenueTeamDailyComparative extends Vue.with(Props) {
  loading = true
  noData = true
  error = ''
  yearMonthArray: string[] = []
  chartData: ComparativeTeamDaily = {
    yearMonthArr: [],
    days: [],
    valueSeries: []
  }

  get filterDisabled () {
    if (!this.sellersCode && !this.teamsCode) {
      return true
    }

    if (this.sellersCode?.length <= 1 && !this.teamsCode) {
      return true
    }

    return false
  }

  get isLeafTeam () {
    return this.$store.state.sales.isLeafTeam
  }

  get teamsMap () {
    return this.$store.state.sales.teamsMap ?? new Map()
  }

  get sellersMap () {
    return this.$store.state.sales.sellersMap ?? new Map()
  }

  get dateLabel () {
    return format(new Date(`${this.idMesAno}-01 00:00`), 'MMMM - yyyy', { locale: ptBR })
  }

  getTeamName (cd: number) {
    return this.teamsMap.get(cd)?.nmEquipe ?? 'Erro'
  }

  getSellerName (cd: number) {
    return this.sellersMap.get(cd)?.nmVendedor ?? 'Erro'
  }

  chart = {
    options: {
      labels: {},
      chart: {
        toolbar: {
          show: false
        },
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      tooltip: {
        y: {
          formatter: NumberUtils.number2currency
        }
      },
      stroke: {
        width: 2
      },
      yaxis: {
        labels: {
          formatter: NumberUtils.number2thousand
        }
      },
      xaxis: {
        categories: [1, 1, 2, 3, 4, 5],
        tooltip: {
          enabled: false
        },
        labels: {
          show: false,
          formatter: (value: number): string => {
            return `Dia ${value}`
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

  nextStateTeams (cds: number[]) {
    this.$emit('nextState', {
      component: 'RevenueComparative',
      props: {
        teamsCode: cds,
        idMesAno!: this.idMesAno,
        count: this.count,
        accumulated: this.accumulated
      }
    })
  }

  nextStateSellers (cds: number[]) {
    this.$emit('nextState', {
      component: 'RevenueComparative',
      props: {
        sellersCode: cds,
        idMesAno!: this.idMesAno,
        count: this.count,
        accumulated: this.accumulated
      }
    })
  }

  mounted () {
    this.getData()
  }

  async updateProps () {
    this.loading = true
    this.noData = true
    this.error = ''
    this.yearMonthArray = []
    this.chartData = {
      yearMonthArr: [],
      days: [],
      valueSeries: []
    }

    await this.getData()
  }

  async getData () {
    try {
      this.loading = true
      this.noData = false
      this.error = ''
      this.chartData = await this.$store.dispatch('sales/faturamento/comparativeTeamDaily', {
        yearMonth: this.idMesAno,
        teamsCode: this.teamsCode,
        sellersCode: this.sellersCode,
        count: this.count,
        accumulated: true
      })

      this.yearMonthArray = this.chartData.yearMonthArr
      this.chart.series = []

      const seriesName: string[] = this.chartData.yearMonthArr.map(yearMonth => {
        const date = new Date(`${yearMonth}-01 00:00`)
        return format(date, 'LLLL', { locale: ptBR })
      })

      if (this.chartData.valueSeries.length) {
        this.chart.options.xaxis.categories = this.chartData.days
        for (let i = 0; i < this.chartData.yearMonthArr.length; i++) {
          this.chart.series.push({
            type: 'line',
            name: seriesName[i],
            data: this.chartData.valueSeries[i]
          })
        }
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
