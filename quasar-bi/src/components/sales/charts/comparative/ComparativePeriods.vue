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
    :filter-disabled="iterationMode === 'periods'"
  >
    <template
      v-slot:filter
    >
      <div
        class="column"
      >
        <q-btn
          v-if="expandTeam"
          label="Agrupar"
          icon="show_chart"
          unelevated
          @click="toggleExpandTeam"
        />
        <q-btn
          v-else
          label="Expandir"
          icon="stacked_line_chart"
          unelevated
          @click="toggleExpandTeam"
        />
      </div>
        <!--q-btn-group
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
        </q-btn-group-->
    </template>

  </chart-base>
</template>

<script lang="ts">
import ChartBase from 'components/ChartBase.vue'
import { defineComponent, ref, Ref, PropType, computed } from 'vue'
import { apiProvider } from 'src/boot/axios'
import { ComparativeLinesDTO } from 'src/dtos/sales/revenue.dto'
import { NumberUtils } from 'src/utils/number.utils'
import { cloneDeep } from 'lodash'

const chartScaffold = {
  options: {
    chart: {
      toolbar: {
        show: false
      },
      type: 'line',
      height: 1500,
      zoom: {
        enabled: false
      }
    },
    tooltip: {
      enabled: true,
      intersect: false,
      shared: true,
      followCursor: false,
      y: {
        formatter: NumberUtils.number2currency
      }
    },
    stroke: {
      curve: 'smooth',
      lineCap: 'butt',
      width: 2
    },
    yaxis: {
      tickAmount: undefined as number | undefined,
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      labels: {
        formatter: NumberUtils.number2thousand
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 0,
        horizontal: false
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      labels: {
        trim: true
      },
      categories: [] as string[]
    }
  }
}

export default defineComponent({
  components: {
    ChartBase
  },

  props: {
    code: { type: Number, required: false },
    type: { type: String, required: false },
    dataMode: { type: String as PropType<'profit' | 'markup' | 'revenue'>, default: 'profit' },
    frequency: { type: String as PropType<'monthly' | 'anualy' | 'semester' | 'quartely'>, default: 'monthly' },
    expandTeam: { type: Boolean, default: false },
    iterationMode: { type: String as PropType<'previous'|'periods'>, default: 'periods' },
    iterationsCount: { type: Number, default: 5 },
    stateCount: { type: Number, default: 0 },
    externNoData: { type: Boolean, default: false },
    externLoading: { type: Boolean, default: false }
  },

  setup (props, { emit }) {
    const chartComponent = ref(null) as Ref<any>
    const loading = ref(false)
    const noData = ref(false)
    const chart = ref(cloneDeep(chartScaffold)) as Ref<any>
    chart.value.options.chart.id = `comparative-${props.dataMode}`
    chart.value.options.chart.group = 'comparative'
    chart.value.options.yaxis.labels.minWidth = '15'
    const error: Ref<string | undefined> = ref(undefined)
    const chartData: Ref<ComparativeLinesDTO | undefined> = ref(undefined)

    const title = computed(() => {
      const titles = {
        profit: 'Lucro',
        markup: 'Markup',
        revenue: 'Faturamento'
      }
      return titles[props.dataMode] ?? 'Erro'
    })

    const getDataFunction = async () => {
      return await apiProvider.axios.get<ComparativeLinesDTO>('bi/sales/comparative', {
        params: {
          data_mode: props.dataMode,
          code: props.code,
          type: props.type,
          frequency: props.frequency,
          expand_team: props.expandTeam,
          iteration_mode: props.iterationMode,
          iterations: props.iterationsCount
        }
      })
    }

    const beforePlot = () => {
      if (props.dataMode !== 'revenue') {
        chart.value.options.yaxis.labels.formatter = (value: number) => `${value}%`
        chart.value.options.tooltip.y.formatter = (value: number) => `${value.toFixed(2)}%`
      } else {
        chart.value.options.yaxis.labels.formatter = NumberUtils.number2thousand
        chart.value.options.tooltip.y.formatter = NumberUtils.number2currency
      }
    }

    const plot = async () => {
      try {
        beforePlot()
        noData.value = false
        loading.value = true
        error.value = undefined
        chartData.value = (await getDataFunction()).data
        chart.value.options.labels = chartData.value.labels// chartData.value.categories.map(date => format(new Date(`${date}-01 00:00`), 'MMM', { locale: ptBR }))
        chart.value.series = chartData.value.series
        noData.value = !chartData.value.series.some(serie => serie.data.some(value => value > 0))
      } catch (err: any) {
        console.error(err)
        error.value = `Erro ${err?.response?.status ?? 'interno'}`
      } finally {
        loading.value = false
      }
    }

    const updateProps = async () => await plot()

    const toggleExpandTeam = () => {
      emit('nextState', {
        component: 'ComparativePeriods',
        props: {
          ...props,
          expandTeam: !props.expandTeam
        }
      })
    }

    return {
      title,
      updateProps,
      chartComponent,
      loading,
      noData,
      error,
      chart,
      toggleExpandTeam
    }
  }
})
</script>
