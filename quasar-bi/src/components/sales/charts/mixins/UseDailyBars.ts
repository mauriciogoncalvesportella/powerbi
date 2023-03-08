import { ref, Ref } from 'vue'
import { AxiosResponse } from 'axios'
import { DateUtils } from 'src/utils/date.utils'
import { NumberUtils } from 'src/utils/number.utils'
import { cloneDeep } from 'lodash'
import { IBaseDailyChart } from 'src/dtos/sales/revenue.dto'
import { format } from 'date-fns'
import { getCssVar } from 'quasar'

const chartScaffold = {
  options: {
    labels: {},
    chart: {
      toolbar: {
        show: false
      },
      stacked: false,
      zoom: {
        enabled: false
      }
    },
    colors: [getCssVar('apex0'), getCssVar('apex1'), getCssVar('apex2')],
    tooltip: {
      x: {
        formatter: DateUtils.date2DayAndWeekday
      },
      y: {
        formatter: NumberUtils.number2currency
      }
    },
    stroke: {
      width: [0, 2]
    },
    yaxis: {
      /*
      tickAmount: undefined as number | undefined,
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      */
      // forceNiceScale: true,
      labels: {
        formatter: NumberUtils.number2thousand
      }
    },
    xaxis: {
      tooltip: {
        enabled: false
      },
      type: 'datetime', // 'datetime',
      labels: {
        // formatter: undefined as ((value: number) => string) | undefined
        formatter: (value: number) => {
          if (value) {
            return format(new Date(value), 'dd')
          }
        }
      }
    },
    dataLabels: {
      enabled: false
      /*
      enabled: true,
      enabledOnSeries: [2],
      formatter: NumberUtils.number2thousand
      */
    }
  },
  series: [] as any[]
}

export interface DailyBarsHooks <T> {
  beforeGetDataFunction?: (chart: any) => void,
  afterGetDataFunction?: (dto: T, chart: any) => void
}

export const useDailyBars = <T extends IBaseDailyChart>(
  getDataFunction: () => Promise<AxiosResponse<T>>,
  generateSeries?: (dto: T) => any,
  hooks?: DailyBarsHooks<T>,
  noDataFunction?: (dto: T) => boolean
) => {
  const noData = ref(false) as Ref<boolean>
  const loading = ref(true) as Ref<boolean>
  const error = ref(undefined) as Ref<string | undefined>

  const chartData = ref({
    values: [],
    goal_values: [],
    goal: 0,
    dates: [],
    meta: {}
  }) as Ref<T>
  const chart = ref(cloneDeep(chartScaffold)) as Ref<any>
  const seriesValueTitle = ref('Realizado')
  const seriesGoalTitle = ref('Meta')

  const getData = async () => {
    try {
      hooks?.beforeGetDataFunction?.(chart.value)
      loading.value = true
      noData.value = false
      error.value = undefined
      chartData.value = (await getDataFunction()).data
      chartData.value.dates = DateUtils.datesToLocalDate(chartData.value.dates as string[])

      if (chartData.value.dates.length) {
        chart.value.options.labels = chartData.value.dates
        if (generateSeries === undefined) {
          chart.value.series = [{
            type: 'bar',
            name: seriesValueTitle,
            data: chartData.value.values
          }, {
            type: 'line',
            name: seriesGoalTitle,
            data: chartData.value.goal_values
          }]
        } else {
          chart.value.series = generateSeries(chartData.value)
        }
        noData.value = !chartData.value.values.some(item => item > 0)
      } else {
        noData.value = true
      }

      if (noDataFunction) {
        noData.value = noDataFunction(chartData.value)
      }

      hooks?.afterGetDataFunction?.(chartData.value, chart.value)
    } catch (err: any) {
      error.value = `Erro ${err?.response?.status ?? 'interno'}`
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const updateProps = async () => await getData()

  return {
    noData,
    loading,
    error,
    chartData,
    chart,
    getData,
    updateProps,
    seriesGoalTitle,
    seriesValueTitle
  }
}
