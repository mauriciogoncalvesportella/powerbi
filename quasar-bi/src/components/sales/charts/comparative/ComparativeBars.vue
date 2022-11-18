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
    filter-disabled
  />
</template>

<script lang="ts">
import ChartBase from 'components/ChartBase.vue'
import { defineComponent, ref, Ref, PropType, computed } from 'vue'
import { format, addMonths } from 'date-fns'
import { apiProvider } from 'src/boot/axios'
import { ComparativeDTO } from 'src/dtos/sales/revenue.dto'
import { NumberUtils } from 'src/utils/number.utils'
import { cloneDeep } from 'lodash'
import { ptBR } from 'date-fns/locale'

const chartScaffold = {
  options: {
    chart: {
      toolbar: {
        show: false
      },
      type: 'line',
      height: 1500
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
  },
  series: [] as any[]
}

export default defineComponent({
  components: {
    ChartBase
  },

  props: {
    code: { type: Number, required: false },
    type: { type: String, required: false },
    chartType: { type: String as PropType<'profit' | 'markup' | 'revenue'>, default: 'profit' },
    stateCount: { type: Number, default: 0 },
    externNoData: { type: Boolean, default: false },
    externLoading: { type: Boolean, default: false }
  },

  setup (props) {
    const chartComponent = ref(null) as Ref<any>
    const endYearMonth = format(addMonths(new Date(), 0), 'yyyy-MM')
    const startYearMonth = format(addMonths(new Date(), -5), 'yyyy-MM')
    const loading = ref(false)
    const noData = ref(false)
    const chart = ref(cloneDeep(chartScaffold)) as Ref<any>
    chart.value.options.chart.id = `comparative-${props.chartType}`
    chart.value.options.chart.group = 'comparative'
    chart.value.options.yaxis.labels.minWidth = '15'
    const error: Ref<string | undefined> = ref(undefined)
    const chartData: Ref<ComparativeDTO | undefined> = ref(undefined)

    const title = computed(() => {
      const titles = {
        profit: 'Lucro',
        markup: 'Markup',
        revenue: 'Faturamento'
      }
      return titles[props.chartType] ?? 'Erro'
    })

    const getDataFunction = async () => {
      return await apiProvider.axios.get<ComparativeDTO>(`bi/sales/comparative/${props.chartType}`, {
        params: {
          code: props.code,
          type: props.type,
          interval: [startYearMonth, endYearMonth]
        }
      })
    }

    const generateSeries = (dto: ComparativeDTO) => {
      return dto.series.map(serie => ({
        name: serie.label,
        type: 'line',
        data: serie.values
      }))
    }

    const beforePlot = () => {
      if (props.chartType === 'profit' || props.chartType === 'markup') {
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
        chart.value.options.labels = chartData.value.categories.map(date => format(new Date(`${date}-01 00:00`), 'MMM', { locale: ptBR }))
        chart.value.series = generateSeries(chartData.value)
        noData.value = !chartData.value.series.some(serie => serie.values.some(value => value > 0))
      } catch (err: any) {
        console.error(err)
        error.value = `Erro ${err?.response?.status ?? 'interno'}`
      } finally {
        loading.value = false
      }
    }

    const updateProps = async () => await plot()

    return {
      title,
      updateProps,
      chartComponent,
      loading,
      noData,
      error,
      chart
    }
  }
})
</script>
