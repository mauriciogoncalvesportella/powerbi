<template>
  <chart-base
    ref="chartComponent"
    title="Clientes x Linearidade"
    :apex-options="chart.options"
    :apex-series="chart.series"
    :loading="(loading || externLoading) && !externNoData"
    :no-data="noData || externNoData"
    :error="error"
    :state-count="stateCount"
    :flex="flex"
    filter-disabled
    @data-point-selection="nextStateFromChart"
  >
    <!--template
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
          <q-chip
            icon="event"
            size="11.5px"
            :label="dateLabel"
          />
          <q-chip
            size="11.5px"
            :icon="type === 'seller' ? 'person' : 'groups'"
          >
            {{ getLabel(cd) }}
          </q-chip>
        </div>
      </q-scroll-area>
    </template-->
  </chart-base>
</template>

<script lang="ts">
import OrderTableDialog from 'src/components/sales/OrderTableDialog.vue'
import YearMonthChip from 'src/components/YearMonthChip.vue'
import ChartBase from 'components/ChartBase.vue'
import { NumberUtils } from 'src/utils/number.utils'
import { useStore } from 'src/store'
import { apiProvider } from 'src/boot/axios'
import { useSimpleBars } from '../mixins/UseSimpleBars'
import { ref, Ref, defineComponent, computed } from 'vue'
// import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { LinearityResumeDTO } from 'src/dtos/sales/revenue.dto'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import addMonths from 'date-fns/esm/addMonths'
import { useLinearity } from 'src/reactive/UseLinearity'
import { useAuth } from 'src/reactive/UseAuth'

export default defineComponent({
  components: {
    ChartBase,
    OrderTableDialog,
    YearMonthChip
  },

  props: {
    code: { type: Number, required: false },
    type: { type: String, required: false },
    stateCount: { type: Number, default: 0 },
    externLoading: { type: Boolean, default: false },
    externNoData: { type: Boolean, default: false },
    flex: { type: Boolean, default: true }
  },

  setup (props) {
    const chartComponent = ref(null) as Ref<any>
    const $store = useStore()
    const currentYearMonth = useAuth().currentYearMonth
    const compareDate = currentYearMonth.value ? new Date(`${currentYearMonth.value}-01 00:00`) : new Date()
    const endYearMonth = format(addMonths(compareDate, -1), 'yyyy-MM')
    const startYearMonth = format(addMonths(compareDate, -5), 'yyyy-MM')

    const getDataFunction = async () => {
      return await apiProvider.axios.get<any>('bi/sales/linearity/resume-chart', {
        params: {
          cd: props.code,
          start: startYearMonth,
          end: endYearMonth,
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
      getData,
      seriesValueTitle,
      seriesGoalTitle
    } = useSimpleBars<LinearityResumeDTO>(getDataFunction)

    const { setCountFilter, mobileCurrentTab } = useLinearity()
    const dateLabel = computed(() => {
      const start = format(new Date(`${startYearMonth}-01`), 'LLLL', { locale: ptBR })
      const end = format(new Date(`${endYearMonth}-01`), 'LLLL', { locale: ptBR })
      return `de ${start} até ${end}`
    })

    seriesValueTitle.value = 'Faturamento'
    seriesGoalTitle.value = 'Meta'
    chart.value.options.yaxis.labels.formatter = NumberUtils.number2thousand
    chart.value.options.tooltip.y.formatter = NumberUtils.number2thousand

    const nextStateFromChart = (event: any, chartContext: any, { dataPointIndex }: any) => {
      setCountFilter(chartData.value?.count[dataPointIndex] ?? -1)
      mobileCurrentTab.value = 'list'
    }

    const getLabel = (cd: number) => {
      if (props.type === 'seller') {
        const map = $store.state.sales.sellersMap ?? new Map()
        return map.get(cd)?.nmVendedor ?? 'Erro'
      }
      const map = $store.state.sales.teamsMap ?? new Map()
      return map.get(cd)?.nmEquipe ?? 'Erro'
    }

    const updateProps = () => {
      if (!props.externNoData) {
        getData()
      }
    }

    /*
    onMounted(() => getData())
    watch(teamHeader, () => {
      emit('newState', {
        component: 'LinearityQuantityChart',
        props: {
          cd: teamHeader.value?.cd,
          type: teamHeader.value?.type
        }
      })
    })
    */

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
      nextStateFromChart
    }
  }
})
</script>
