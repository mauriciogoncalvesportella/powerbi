<template>
  <chart-base
    ref="chartComponent"
    title="Lucro diário"
    :apex-options="chart.options"
    :apex-series="chart.series"
    :loading="(loading || externLoading) && !externNoData"
    :no-data="noData || externNoData"
    :error="error"
    :state-count="stateCount"
    @data-point-selection="nextState"
  >
    <template
      v-slot:filter
    >
      <q-btn
        :label="cumulative ? 'Alterar para diário' : 'Alternar para acumulado'"
        class="full-width"
        icon="signal_cellular_alt"
        unelevated
        @click="changeCumulative"
      />
    </template>
  </chart-base>
</template>

<script lang="ts">
import { apiProvider } from 'src/boot/axios'
import { ProfitDailyBars } from 'src/dtos/sales/revenue.dto'
import ChartBase from 'components/ChartBase.vue'
import { defineComponent, ref, Ref } from 'vue'
import { DailyBarsHooks, useDailyBars } from '../mixins/UseDailyBars'
import { format } from 'date-fns'
import { NumberUtils } from 'src/utils/number.utils'
import { getCssVar } from 'quasar'

export default defineComponent({
  components: {
    ChartBase
  },

  props: {
    code: { type: Number, required: false },
    type: { type: String, require: false },
    yearMonth: { type: String, require: false },
    cumulative: { type: Boolean, default: false },
    stateCount: { type: Number, default: 0 },
    externLoading: { type: Boolean, default: false },
    externNoData: { type: Boolean, default: false }
  },

  setup (props, { emit }) {
    const chartComponent = ref(null) as Ref<any>

    const hooks: DailyBarsHooks<ProfitDailyBars> = {
      beforeGetDataFunction: (chart: any) => {
        chart.options.chart.stacked = false
        chart.options.yaxis.labels.formatter = (value: number) => `${value}%`
        chart.options.stroke.width = [0, 3, 3]
      },
      afterGetDataFunction: (dto: ProfitDailyBars, chart: any) => {
        chart.options.colors = [getCssVar('markup_value')]
        chart.options.tooltip.y = [{ formatter: (value: number) => `${value.toFixed(2)}%` }]
        if (dto.goal_values.some(goal => goal > 0)) {
          chart.options.tooltip.y.push({ formatter: (value: number) => `${value.toFixed(2)}%` })
          chart.options.colors.push(getCssVar('markup_goal'))
        }
        if (dto.billed.some(billed => billed > 0)) {
          chart.options.tooltip.y.push({
            formatter: (_: any, { dataPointIndex }: any) => {
              const value = dto.billed[dataPointIndex] + dto.not_billed[dataPointIndex]
              return `${NumberUtils.number2currency(value)}`
            }
          })
          chart.options.colors.push(getCssVar('markup_billed'))
          chart.options.stroke.curve = 'smooth'
        }
      }
    }

    const getDataFunction = async () => {
      const response = await apiProvider.axios.get<ProfitDailyBars>('bi/sales/profit/profit-daily-chart', {
        params: {
          cd: props.code,
          'year-month': props.yearMonth,
          type: props.type,
          cumulative: props.cumulative
        }
      })
      return response
    }

    const generateSeriesFunction = (data: ProfitDailyBars) => {
      const billedArr = data.billed.map((value, index) => value + data.not_billed[index])
      const maxBilled = Math.max(...billedArr)
      const maxValue = Math.max(...data.values)
      const series = [{ type: 'column', name: 'Lucro', data: data.values }]
      if (data.goal_values.some(goal => goal > 0)) {
        series.push({ type: 'line', name: 'Meta', data: data.goal_values })
      }
      if (billedArr.some(billed => billed > 0)) {
        series.push({
          type: 'line',
          name: 'Faturamento',
          data: billedArr.map(value => (value / maxBilled) * maxValue)
        })
      }
      return series
    }

    const changeCumulative = () => {
      emit('nextState', {
        component: 'ProfitDailyBars',
        props: {
          code: props.code,
          cumulative: !props.cumulative,
          yearMonth: props.yearMonth,
          type: props.type
        }
      })
    }

    const {
      noData,
      loading,
      error,
      chartData,
      chart,
      getData
    } = useDailyBars<ProfitDailyBars>(getDataFunction, generateSeriesFunction, hooks)

    const updateProps = () => {
      if (!props.externNoData) {
        getData()
      }
    }

    const nextState = (event: any, chartContext: any, { dataPointIndex }: any) => {
      if (props.type === 'team') {
        const initDate = chartData.value.dates[0] as number
        const date = chartData.value.dates[dataPointIndex] as number
        emit('nextState', {
          component: 'ProfitResumeBars',
          props: {
            teamCode: props.code,
            yearMonth: props.yearMonth,
            initDay: props.cumulative
              ? format(initDate, 'yyyy-MM-dd')
              : format(date, 'yyyy-MM-dd'),
            endDay: format(date, 'yyyy-MM-dd')
          }
        })
      }
    }

    return {
      nextState,
      changeCumulative,
      chartComponent,
      noData,
      loading,
      error,
      chartData,
      chart,
      getData,
      updateProps
    }
  }
})
</script>
