<template>
  <chart-base
    ref="chartComponent"
    :title="title"
    :apex-options="chart.options"
    :apex-series="chart.series"
    :loading="(loading || externLoading) && !externNoData"
    :no-data="noData || externNoData"
    :error="error"
    :state-count="stateCount"
    :filter-disabled="noData || error != undefined"
    @data-point-selection="nextMenu"
  >
    <template
      v-if="yearMonth && type"
      v-slot:filter
    >
      <div
        class="column"
      >
        <q-btn
          :label="accumulated ? 'Alternar para diário' : 'Alternar para acumulado'"
          :icon="accumulated ? 'bar_chart' : 'signal_cellular_alt'"
          unelevated
          @click="toAccumulated"
        />
        <q-btn-group
          v-if="accumulated && isCurrentYearMonth"
          spread
        >
          <q-btn
            label="Meta"
            :disable="!prospect"
            @click="changeProspect(false)"
          />
          <q-btn
            label="Expectativa"
            :disable="prospect"
            @click="changeProspect(true)"
          />
        </q-btn-group>
      </div>
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
          <year-month-chip
            :year-month="yearMonth"
            @year-month-click="$emit('NextStateYearMonth', $event)"
          />
        </div>
      </q-scroll-area>
    </template>
  </chart-base>
</template>

<script lang="ts">
import TeamTree from 'src/components/sales/TeamTree.vue'
import TeamList from 'src/components/sales/TeamList.vue'
import ChartBase from 'components/ChartBase.vue'
import SellerList from 'src/components/sales/SellerList.vue'
import YearMonthChip from 'src/components/YearMonthChip.vue'
import { ptBR } from 'date-fns/locale'
import { format } from 'date-fns'
import { useStore } from 'src/store'
import { apiProvider } from 'src/boot/axios'
import { DailyBarsHooks, useDailyBars } from 'src/components/sales/charts/mixins/UseDailyBars'
import { defineComponent, computed, ref, Ref } from 'vue'
import { RevenueDailyDTO } from 'src/dtos/sales/revenue.dto'
import { getCssVar } from 'quasar'
import { NumberUtils } from 'src/utils/number.utils'
import { GetOrderListFromSeller, GlobalOrderInfoDialog } from 'src/reactive/UseGlobalDialogs'
import { useAuth } from 'src/reactive/UseAuth'

export default defineComponent({
  components: {
    ChartBase,
    TeamTree,
    TeamList,
    SellerList,
    YearMonthChip
  },

  props: {
    code: { type: Number, required: false },
    yearMonth: { type: String, required: false },
    type: { type: String, required: false },
    accumulated: { type: Boolean, default: false },
    prospect: { type: Boolean, default: false },
    stateCount: { type: Number, default: 0 },
    externLoading: { type: Boolean, default: false },
    externNoData: { type: Boolean, default: false }
  },

  setup (props, { emit }) {
    const $store = useStore()
    const chartComponent = ref(null) as Ref<any>
    const isCurrentYearMonth = computed(() => useAuth().currentYearMonth.value === props.yearMonth)

    const getDataFunction = async () => {
      const response = await apiProvider.axios.get<RevenueDailyDTO>('bi/sales/profit/revenue-daily-chart', {
        params: {
          cd: props.code,
          'year-month': props.yearMonth,
          type: props.type,
          cumulative: props.accumulated
        }
      })
      return response
    }

    const hooks: DailyBarsHooks<RevenueDailyDTO> = {
      beforeGetDataFunction: (chart: any) => {
        chart.options.chart.type = 'bar'
        chart.options.stroke.width = [1, 2]
        chart.options.chart.stacked = true
        chart.options.yaxis.labels.formatter = (value: number) => NumberUtils.number2thousand(value)
      },
      afterGetDataFunction: (dto: RevenueDailyDTO, chart: any) => {
        chart.options.stroke.width = [0]
        chart.options.colors = [getCssVar('revenue_value')]
        if (dto.goal_values.some(goal => goal > 0)) {
          chart.options.chart.type = undefined
          chart.options.stroke.width.push(2)
          chart.options.colors.push(getCssVar('revenue_goal'))
        }
        if (dto.not_billed.some(value => value > 0)) {
          chart.options.chart.type = undefined
          chart.options.stroke.width.push(0)
          chart.options.colors.push(getCssVar('revenue_not_billed'))
        }
      }
    }

    const generateSeries = (revenueDTO: RevenueDailyDTO) => {
      const series = [{ type: 'column', name: 'Faturado', data: revenueDTO.billed }]

      if (props.accumulated && props.prospect && isCurrentYearMonth.value) {
        if (revenueDTO.prospect.some(it => it > 0)) {
          series.push({ type: 'line', name: 'Expectativa', data: revenueDTO.prospect })
        }
      } else {
        if (revenueDTO.goal_values.some(goal => goal > 0)) {
          series.push({ type: 'line', name: 'Meta', data: revenueDTO.goal_values })
        }
      }

      if (revenueDTO.not_billed.some(it => it > 0)) {
        series.push({ type: 'bar', name: 'Não faturado', data: revenueDTO.not_billed })
      }
      return series
    }

    const noDataFunction = (revenueDTO: RevenueDailyDTO) => {
      const callback = (value: number) => value > 0
      const { not_billed, values } = revenueDTO
      return !values.some(callback) && !not_billed.some(callback)
    }

    const {
      noData,
      loading,
      error,
      chartData,
      chart,
      getData
    } = useDailyBars<RevenueDailyDTO>(getDataFunction, generateSeries, hooks, noDataFunction)

    const updateProps = () => {
      if (!props.externNoData) {
        getData()
      }
    }

    const isLeafTeam = computed(() => $store.state.sales.isLeafTeam)
    const teamsMap = computed(() => $store.state.sales.teamsMap ?? new Map())
    const sellersMap = computed(() => $store.state.sales.sellersMap ?? new Map())
    const dateLabel = computed(() => format(new Date(`${props.yearMonth}-01 00:00`), 'MMMM - yyyy', { locale: ptBR }))
    const getTeamName = (cd: number) => teamsMap.value.get(cd)?.nmEquipe ?? 'Erro'
    const getSellerName = (cd: number) => sellersMap.value.get(cd)?.nmVendedor ?? 'Erro'

    const toAccumulated = () => {
      emit('nextState', {
        component: 'RevenueDailyChart',
        props: {
          code: props.code,
          yearMonth: props.yearMonth,
          accumulated: !props.accumulated,
          type: props.type,
          prospect: props.prospect
        },
        override: true
      })
    }

    const changeProspect = (value: boolean) => {
      emit('nextState', {
        component: 'RevenueDailyChart',
        props: {
          code: props.code,
          yearMonth: props.yearMonth,
          accumulated: props.accumulated,
          type: props.type,
          prospect: value
        },
        override: true
      })
    }

    const nextMenu = (event: any, chartcontext: any, { dataPointIndex }: { dataPointIndex: number }) => {
      const initDate = chartData.value.dates[0] as number
      const date = chartData.value.dates[dataPointIndex] as number

      const initDay = props.accumulated
        ? format(initDate, 'yyyy-MM-dd')
        : format(date, 'yyyy-MM-dd')
      const endDay = format(date, 'yyyy-MM-dd')

      if (props.type === 'team') {
        emit('nextState', {
          component: 'RevenueResumeChart',
          props: {
            code: props.code,
            initDay,
            endDay
          }
        })
      } else if (props.code !== undefined) {
        GlobalOrderInfoDialog.open(
          new GetOrderListFromSeller(props.code, undefined, initDay, endDay)
        )
      }
    }

    const title = computed(() => {
      return 'Faturamento diário' +
        (props.accumulated ? ' acumulado' : '') +
        (props.prospect ? ' - Expectativa' : ' - Meta')
    })

    return {
      title,
      chartComponent,
      noData,
      loading,
      error,
      chartData,
      chart,
      getData,
      updateProps,
      getTeamName,
      getSellerName,
      isLeafTeam,
      teamsMap,
      dateLabel,
      nextMenu,
      toAccumulated,
      changeProspect,
      isCurrentYearMonth
    }
  }
})
</script>
