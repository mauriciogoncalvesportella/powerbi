<template>
  <chart-base
    ref="chartComponent"
    title="Faturamento Mensal Equipes"
    :apex-options="chart.options"
    :apex-series="chart.series"
    :loading="(loading || externLoading) && !externNoData"
    :no-data="noData || externNoData"
    :error="error"
    :state-count="stateCount"
    @data-point-selection="nextStateFromChart"
  >
    <template
      v-slot:filter
    >
      <q-btn
        :label="`Usar meta ${goalType === 'proportional' ? 'mensal' : 'proporcional'}`"
        class="full-width"
        unelevated
        @click="onChangeGoalType"
      />
    </template>
    <template
      v-if="type && yearMonth"
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
            :year-month="yearMonth"
            @year-month-click="$emit('NextStateYearMonth', $event)"
          />
          <q-chip
            v-else
            icon="event"
            size="11.5px"
            :label="dateLabel"
          />
          <!--q-chip
            v-for="cd in codes"
            :key="`q-chip-${cd}`"
            size="11.5px"
            :icon="type === 'seller' ? 'person' : 'groups'"
          >
            {{ getLabel(cd) }}
          </q-chip-->
        </div>
      </q-scroll-area>
    </template>
  </chart-base>
</template>

<script lang="ts">
import OrderTableDialog from 'src/components/sales/OrderTableDialog.vue'
import YearMonthChip from 'src/components/YearMonthChip.vue'
import ChartBase from 'components/ChartBase.vue'
import { NumberUtils } from 'src/utils/number.utils'
import { useStore } from 'src/store'
import { apiProvider } from 'src/boot/axios'
import { ResumeBarsHooks, useResumeBars } from '../mixins/UseResumeBars'
import { DateUtils } from 'src/utils/date.utils'
import { ref, Ref, defineComponent, computed, PropType } from 'vue'
// import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
// import { useTeamDropdown } from 'src/reactive/TeamDropdown'
import { RevenueResumeDTO } from 'src/dtos/sales/revenue.dto'
import { getCssVar } from 'quasar'
import { useAuth } from 'src/reactive/UseAuth'
import { GetOrderListFromSeller, GlobalOrderInfoDialog } from 'src/reactive/UseGlobalDialogs'

export default defineComponent({
  components: {
    ChartBase,
    OrderTableDialog,
    YearMonthChip
  },

  props: {
    code: { type: Number, required: false },
    yearMonth: { type: String, required: false },
    type: { type: String, required: false },
    initDay: { type: String, required: false },
    endDay: { type: String, required: false },
    stateCount: { type: Number, default: 0 },
    goalType: { type: String as PropType<'proportional' | 'full'>, default: 'proportional' },
    externNoData: { type: Boolean, default: false },
    externLoading: { type: Boolean, default: false }
  },

  setup (props, { emit }) {
    const chartComponent = ref(null) as Ref<any>
    const $store = useStore()
    const getDataFunction = async () => {
      return await apiProvider.axios.get<any>('bi/sales/profit/revenue-resume-chart', {
        params: {
          'team-code': props.code,
          'year-month': props.yearMonth,
          'init-day': props.initDay,
          'end-day': props.endDay,
          type: props.type
        }
      })
    }

    const hooks: ResumeBarsHooks<RevenueResumeDTO> = {
      beforeGetDataFunction: (chart: any) => {
        chart.options.colors = [getCssVar('revenue_value'), getCssVar('revenue_goal')]
        chart.options.plotOptions = { bar: { horizontal: false } }
        chart.options.yaxis.labels.formatter = (value: number) => NumberUtils.number2thousand(value)
        chart.options.xaxis.labels.formatter = (value: number) => `${value}`
      }
      /*
      afterGetDataFunction: (dto: RevenueResumeDTO, chart: any) => {
        if (dto.codes.length >= 5) {
          chart.options.plotOptions = { bar: { horizontal: false } }
          chart.options.xaxis.labels.formatter = (value: number) => NumberUtils.number2thousand(value)
          chart.options.yaxis.labels.formatter = (value: number) => `${value}`
        }
      }
      */
    }

    const generateSeries = (revenueDTO: RevenueResumeDTO) => {
      const series = [{
        name: 'Faturamento',
        type: 'bar',
        data: revenueDTO.billed.map((revenue, index) => revenue + revenueDTO.not_billed[index])
      }]
      if (revenueDTO.goal_values.some(item => item > 0)) {
        const closeDay = useAuth().user.value?.dtFechamento ?? 0
        const monthRatio = props.goalType === 'proportional'
          ? DateUtils.monthRatio(props.initDay, props.endDay, props.yearMonth, closeDay)
          : 1
        revenueDTO.goal_values = revenueDTO.goal_values.map(revenue => revenue * monthRatio)
        /*
        const closeDay = useAuth().user.value?.dtFechamento ?? 0
        const initDay = props.initDay ? `${props.initDay} 00:00` : undefined
        const endDay = props.endDay ? `${props.endDay} 00:00` : undefined

        if (DateUtils.currentDateInInterval(initDay, endDay, props.yearMonth, closeDay)) {
          const monthRatio = DateUtils.monthRatio(initDay, endDay, props.yearMonth)
          revenueDTO.goal_values = revenueDTO.goal_values.map(revenue => revenue * monthRatio)
        }
        */

        series.push({
          name: 'Meta',
          type: 'bar',
          data: revenueDTO.goal_values
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
      getData,
      // updateProps,
      seriesValueTitle,
      seriesGoalTitle
    } = useResumeBars<RevenueResumeDTO>(getDataFunction, generateSeries, hooks)

    const updateProps = () => {
      if (!props.externNoData) {
        getData()
      }
    }

    const dateLabel = computed(() => {
      const initDay = props.initDay ? new Date(`${props.initDay} 00:00`).getTime() : undefined
      const endDay = props.endDay ? new Date(`${props.endDay} 00:00`).getTime() : undefined
      return DateUtils.dateLabels(initDay, endDay, props.yearMonth)
    })
    seriesValueTitle.value = 'Faturamento'
    seriesGoalTitle.value = 'Meta'
    chart.value.options.yaxis.labels.formatter = NumberUtils.number2thousand
    chart.value.options.tooltip.y.formatter = NumberUtils.number2thousand

    const nextStateFromChart = (event: any, chartContext: any, { dataPointIndex }: any) => {
      const cd = chartData.value.codes[dataPointIndex]
      const type = chartData.value.type[dataPointIndex]
      if (cd !== null) {
        if (type === 'team') {
          emit('nextState', {
            component: 'RevenueResumeChart',
            props: {
              code: cd,
              yearMonth: props.yearMonth,
              type: 'team',
              initDay: props.initDay,
              endDay: props.endDay
            }
          })
        } else {
          GlobalOrderInfoDialog.open(
            new GetOrderListFromSeller(cd, props.yearMonth, props.initDay, props.endDay)
          )
        }
      }
    }

    const onChangeGoalType = () => {
      emit('nextState', {
        component: 'RevenueResumeChart',
        props: {
          code: props.code,
          yearMonth: props.yearMonth,
          type: props.type,
          initDay: props.initDay,
          endDay: props.endDay,
          goalType: props.goalType === 'proportional' ? 'full' : 'proportional'
        }
      })
    }

    const getLabel = (cd: number) => {
      if (props.type === 'seller') {
        const map = $store.state.sales.sellersMap ?? new Map()
        return map.get(cd)?.nmVendedor ?? 'Erro'
      }
      const map = $store.state.sales.teamsMap ?? new Map()
      return map.get(cd)?.nmEquipe ?? 'Erro'
    }

    return {
      chartComponent,
      noData,
      loading,
      error,
      chartData,
      chart,
      dateLabel,
      updateProps,
      getLabel,
      nextStateFromChart,
      onChangeGoalType
    }
  }
})
</script>
