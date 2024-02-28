<template>
  <chart-base
    ref="chartComponent"
    title="Lucro mensal"
    :apex-options="chart.options"
    :apex-series="chart.series"
    :loading="(loading || externLoading) && !externNoData"
    :no-data="noData || externNoData"
    :error="error"
    :state-count="stateCount"
    filter-disabled
    @data-point-selection="nextState"
  >
    <!--template
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
          <q-chip
            icon="event"
            size="11.5px"
            :label="dateLabel"
          />
        </div>
      </q-scroll-area>
    </template-->
  </chart-base>
</template>

<script lang="ts">
import { ref, Ref, defineComponent, computed } from 'vue'
import ChartBase from 'components/ChartBase.vue'
import { apiProvider } from 'src/boot/axios'
import { ProfitResumeBars } from 'src/dtos/sales/revenue.dto'
import { ResumeBarsHooks, useResumeBars } from '../mixins/UseResumeBars'
import { DateUtils } from 'src/utils/date.utils'
import { NumberUtils } from 'src/utils/number.utils'
import { getCssVar } from 'quasar'

export default defineComponent({
  components: {
    ChartBase
  },

  props: {
    teamCode: { type: Number, required: false },
    initDay: { type: String, required: false },
    yearMonth: { type: String, required: false },
    endDay: { type: String, required: false },
    stateCount: { type: Number, default: 0 },
    externNoData: { type: Boolean, default: false },
    externLoading: { type: Boolean, default: false }
  },

  setup (props, { emit }) {
    const chartComponent = ref(null) as Ref<any>

    const dateLabel = computed(() => {
      const initDay = props.initDay ? new Date(`${props.initDay} 00:00`).getTime() : undefined
      const endDay = props.endDay ? new Date(`${props.endDay} 00:00`).getTime() : undefined
      return DateUtils.dateLabels(initDay, endDay, props.yearMonth)
    })

    const getDataFunction = async () => {
      const yearMonthParam = props.initDay && props.endDay
        ? undefined
        : props.yearMonth

      return await apiProvider.axios.get<ProfitResumeBars>('bi/sales/revenue/profit-resume-chart', {
        params: {
          'team-code': props.teamCode,
          'year-month': yearMonthParam,
          'init-day': props.initDay,
          'end-day': props.endDay
        }
      })
    }

    const hooks: ResumeBarsHooks<ProfitResumeBars> = {
      beforeGetDataFunction: (chart: any) => {
        chart.options.yaxis.labels.formatter = (value: number) => `${value}%`
        chart.options.tooltip.y = [
          { formatter: (value: number) => `${value.toFixed(2)}%` },
          { formatter: (value: number) => `${value.toFixed(2)}%` },
          {
            formatter: (_: any, { dataPointIndex }: any) => {
              const value = chartData.value.billed[dataPointIndex]
              return `${NumberUtils.number2currency(value)}`
            }
          }
        ]
        chart.options.plotOptions = { bar: { horizontal: false } }
        chart.options.xaxis.labels.formatter = (value: number) => `${value}`
        chart.options.yaxis.labels.formatter = (value: number) => `${value}%`
      },
      afterGetDataFunction: (dto: ProfitResumeBars, chart: any) => {
        chart.options.colors = [getCssVar('profit_value')]
        chart.options.tooltip.y = [{ formatter: (value: number) => `${value.toFixed(2)}%` }]
        if (dto.goal_values.some(goal => goal > 0)) {
          chart.options.tooltip.y.push(chart.options.tooltip.y[0])
          chart.options.colors.push(getCssVar('profit_goal'))
        }
        if (dto.billed.some(billed => billed > 0)) {
          chart.options.tooltip.y.push({
            formatter: (_: any, { dataPointIndex }: any) => {
              const value = dto.billed[dataPointIndex] + dto.not_billed[dataPointIndex]
              return `${NumberUtils.number2currency(value)}`
            }
          })
          chart.options.colors.push(getCssVar('profit_billed'))
        }
        /*
        if (dto.codes.length >= 5) {
          chart.options.plotOptions = { bar: { horizontal: true } }
          chart.options.xaxis.labels.formatter = (value: number) => `${value}%`
          chart.options.yaxis.labels.formatter = (value: number) => `${value}`
        }
        */
      }
    }

    const generateSeriesFunction = (data: ProfitResumeBars) => {
      const billedArr = data.billed.map((value, index) => value + data.not_billed[index])
      const maxBilled = Math.max(...billedArr)
      const maxValue = Math.max(...data.values)
      const series = [{ type: 'bar', name: 'Lucro', data: data.values }]
      if (data.goal_values.some(goal => goal > 0)) {
        series.push({ type: 'bar', name: 'Meta', data: data.goal_values })
      }
      if (data.billed.some(billed => billed > 0)) {
        series.push({
          type: 'bar',
          name: 'Faturamento',
          data: billedArr.map(value => (value / maxBilled) * maxValue)
        })
      }
      return series
    }

    const {
      noData,
      loading,
      error,
      chartData,
      chart,
      getData
    } = useResumeBars<ProfitResumeBars>(getDataFunction, generateSeriesFunction, hooks)

    const updateProps = () => {
      if (!props.externNoData) {
        getData()
      }
    }

    const nextState = (event: any, chartContext: any, { dataPointIndex }: any) => {
      const type = chartData.value.type[dataPointIndex]
      if (type === 'team') {
        const teamCode = chartData.value.codes[dataPointIndex]
        emit('nextState', {
          component: 'ProfitResumeBars',
          props: {
            teamCode,
            yearMonth: props.yearMonth,
            initDay: props.initDay,
            endDay: props.endDay
          }
        })
      }
    }

    return {
      chartComponent,
      noData,
      loading,
      error,
      chartData,
      chart,
      dateLabel,
      nextState,
      updateProps
    }
  }
})
</script>
