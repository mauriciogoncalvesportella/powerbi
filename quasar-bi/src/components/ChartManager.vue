<template>
  <div>
    <component
      v-show="!loading && !disableChart"
      ref="chart"
      :is="currentChartState.component"
      :key="key"
      v-bind="currentChartState.props"
      @next-state-year-month="nextStateYearMonth($event)"
      @nextState="nextState($event)"
      @newState="newState($event)"
      @backState="backState"
      @dataSelect="dataSelect"
    />
    <chart-skeleton-loading
      v-show="loading"
    />
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import ChartSkeletonLoading from 'components/sales/charts/ChartSkeletonLoading.vue'
import RevenueTeamAccumulated from 'components/sales/charts/revenue/RevenueTeamAccumulated.vue'
import RevenueTeamMonthly from 'components/sales/charts/revenue/RevenueTeamMonthly.vue'
import RevenueSellersMonthly from 'components/sales/charts/revenue/RevenueSellersMonthly.vue'
import RevenueSellers from 'components/sales/charts/revenue/RevenueSellers.vue'
import RevenueSellersAccumulated from 'components/sales/charts/revenue/RevenueSellersAccumulated.vue'
import RevenueComparative from 'components/sales/charts/revenue/RevenueComparative.vue'
import MarkupDailyBars from 'components/sales/charts/markup/MarkupDailyBars.vue'
import MarkupResumeBars from 'components/sales/charts/markup/MarkupResumeBars.vue'
import ProfitDailyBars from 'components/sales/charts/profit/ProfitDailyBars.vue'
import ProfitResumeBars from 'components/sales/charts/profit/ProfitResumeBars.vue'
import RevenueDailyChart from 'components/sales/charts/revenue/RevenueDailyChart.vue'
import RevenueResumeChart from 'components/sales/charts/revenue/RevenueResumeChart.vue'
import LinearityQuantityChart from 'components/sales/charts/linearity/LinearityQuantityChart.vue'
import LinearityPotentialChart from 'components/sales/charts/linearity/LinearityPotentialChart.vue'
import FactoryResumeChart from 'components/sales/charts/factory/FactoryResumeChart.vue'
import FactoryResumeTeamChart from 'components/sales/charts/factory/FactoryResumeTeamChart.vue'
import ComparativeBars from 'components/sales/charts/comparative/ComparativeBars.vue'
import ComparativePeriods from 'components/sales/charts/comparative/ComparativePeriods.vue'
import { cloneDeep } from 'lodash'

interface ChartState {
  component: string,
  props: any
}

class Props {
  startComponent!: string;
  loading!: boolean;
  disableChart!: boolean;
  startProps!: any
}

@Options({
  components: {
    ChartSkeletonLoading,
    RevenueDailyChart,
    RevenueTeamAccumulated,
    RevenueTeamMonthly,
    RevenueSellersMonthly,
    RevenueSellers,
    RevenueSellersAccumulated,
    RevenueComparative,
    MarkupDailyBars,
    MarkupResumeBars,
    ProfitDailyBars,
    ProfitResumeBars,
    RevenueResumeChart,
    LinearityQuantityChart,
    LinearityPotentialChart,
    FactoryResumeChart,
    FactoryResumeTeamChart,
    ComparativeBars,
    ComparativePeriods
  }
})
export default class ChartManager extends Vue.with(Props) {
  states: ChartState[] = []
  index = 0
  key = 0

  get currentChartState (): ChartState {
    return this.states[this.index]
  }

  getFromYearMonth (): boolean {
    const chartEl: any = this.$refs.chart
    return !(chartEl && chartEl.initDay && chartEl.endDay)
  }

  created () {
    this.states = []
    this.startProps.stateCount = 0
    this.states.push({
      component: this.startComponent,
      props: this.startProps
    })
    this.index = 0
  }

  nextStateYearMonth (yearMonth: string) {
    // ++this.index
    if (this.getFromYearMonth()) {
      const prev = this.states[this.index]
      const state = cloneDeep(this.states[this.index])
      state.props.idMesAno = yearMonth
      state.props.yearMonth = yearMonth
      this.states[this.index] = state
      this.updateChartComponent(prev)
    }
  }

  /**
   * Adiciona um novo estado à pilha de estados `states` do ChartManager
   *
   * @param state - estado a ser adicionado com o parâmetro `override`,
   *                que quando ativado, substitui o estado de um mesmo
   *                gráfico (state.component)
   */
  nextState (state: ChartState & { override?: boolean }) {
    // this.$emit('next-state', state)
    const override = state.override
    delete state.override

    const foundStateIndex = this.states.findIndex(item => item.component === state.component)
    if (override && foundStateIndex !== -1) {
      const foundState = this.states[foundStateIndex]
      foundState.component = state.component
      foundState.props = state.props
      foundState.props.stateCount = foundStateIndex
    } else {
      ++this.index
      state.props.stateCount = this.index
      this.states.push(state)
    }

    // @ts-ignore
    this.$nextTick(() => { this.$refs.chart.updateProps() })
  }

  newState (state: ChartState) {
    this.index = 0
    state.props.stateCount = 0
    this.states = [state]
    // @ts-ignore
    this.$nextTick(() => this.$refs.chart?.updateProps())
  }

  backState () {
    if (this.states?.length > 1) {
      // const prev = this.states.pop()
      this.states.pop()
      this.index = this.states.length - 1
      // @ts-ignore
      this.$nextTick(() => { this.$refs.chart?.updateProps() })
      // this.updateChartComponent(prev)
    }
  }

  updateChartComponent (previous?: ChartState) {
    const prev: ChartState = previous ?? this.states[this.states.length - 2]
    const curr: ChartState = this.states[this.states.length - 1]
    if (prev && curr && prev.component === curr.component) {
      this.$nextTick(() => {
        // @ts-ignore
        this.$refs.chart?.updateProps()
      })
    }
  }

  dataSelect (value: any) {
    this.$emit('data-select', value)
  }
}
</script>
