<template>
  <chart-base
    ref="chartComponent"
    title="Markup diário"
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
        :label="cumulative ? 'Alternar para diário' : 'Alternar para acumulado'"
        class="full-width"
        :icon="cumulative ? 'bar_chart' : 'signal_cellular_alt'"
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
// import { DateUtils } from 'src/utils/date.utils'
import { NumberUtils } from 'src/utils/number.utils'
import { getCssVar } from 'quasar'

export default defineComponent({
  components: {
    ChartBase
  },

  props: {
    code: { type: Number, required: false },
    type: { type: String, required: false },
    cumulative: { type: Boolean, default: false },
    yearMonth: { type: String, required: false },
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
          chart.options.tooltip.y.push(chart.options.tooltip.y[0])
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
      const response = await apiProvider.axios.get<ProfitDailyBars>('bi/sales/profit/markup-daily-chart', {
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
      const series = [{ type: 'column', name: 'Markup', data: data.values }]
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
        component: 'MarkupDailyBars',
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

    /*
    watch(yearMonth, () => emit('next-state-year-month', yearMonth))
    watch(teamHeader, () => {
      if (teamHeader.value) {
        emit('newState', {
          component: 'MarkupDailyBars',
          props: {
            code: teamHeader.value.cd,
            yearMonth: yearMonth.value,
            type: teamHeader.value.type
          }
        })
      }
    })
    */

    const nextState = (event: any, chartContext: any, { dataPointIndex }: any) => {
      if (props.type === 'team') {
        const initDate = chartData.value.dates[0] as number
        const date = chartData.value.dates[dataPointIndex] as number
        emit('nextState', {
          component: 'MarkupResumeBars',
          props: {
            teamCode: props.code,
            initDay: props.cumulative
              ? format(initDate, 'yyyy-MM-dd')
              : format(date, 'yyyy-MM-dd'),
            endDay: format(date, 'yyyy-MM-dd'),
            yearMonth: props.yearMonth
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
