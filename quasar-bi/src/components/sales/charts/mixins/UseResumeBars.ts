import { ref, Ref } from 'vue'
import { AxiosResponse } from 'axios'
import { NumberUtils } from 'src/utils/number.utils'
import { cloneDeep } from 'lodash'
import { IBaseResumeChart } from 'src/dtos/sales/revenue.dto'
import { getCssVar } from 'quasar'

const chartScaffold = {
  options: {
    chart: {
      toolbar: {
        show: false
      },
      type: 'bar'
    },
    colors: [getCssVar('apex0'), getCssVar('apex1'), getCssVar('apex2')],
    tooltip: {
      enabled: true,
      intersect: false,
      shared: true,
      followCursor: false,
      y: {
        formatter: NumberUtils.number2currency
      }
    },
    yaxis: {
      tickAmount: undefined as number | undefined,
      min: undefined as number | undefined,
      max: undefined as number | undefined,
      forceNiceScale: true,
      labels: {
        formatter: NumberUtils.number2thousand
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
  series: [
    {
      type: 'bar',
      name: 'Resume bars 0',
      data: [30, 40, 45, 50, 49, 60, 70, 91]
    },
    {
      type: 'bar',
      name: 'Resume bars 1',
      data: [30, 40, 45, 50, 49, 60, 70, 91]
    }
  ]
}

export interface ResumeBarsHooks <T> {
  beforeGetDataFunction?: (chart: any) => void,
  afterGetDataFunction?: (dto: T, chart: any) => void
}

export const useResumeBars = <T extends IBaseResumeChart>(
  getDataFunction: () => Promise<AxiosResponse<T>>,
  generateSeries?: (dto: T) => any,
  hooks?: ResumeBarsHooks<T>
) => {
  const noData = ref(false) as Ref<boolean>
  const loading = ref(false) as Ref<boolean>
  const error = ref(undefined) as Ref<string | undefined>
  const chartData = ref({
    values: [],
    goal_values: [],
    labels: [],
    codes: [],
    type: []
  }) as Ref<T>
  const chart = ref(cloneDeep(chartScaffold)) as Ref<any>
  const seriesValueTitle = ref('Series Value Title')
  const seriesGoalTitle = ref('Series Date Title')

  const getData = async () => {
    try {
      hooks?.beforeGetDataFunction?.(chart.value)
      loading.value = true
      noData.value = false
      error.value = undefined
      chartData.value = (await getDataFunction()).data

      if (chartData.value.codes.length) {
        chart.value.options.labels = chartData.value.labels
        if (generateSeries === undefined) {
          chart.value.series = [{
            name: 'Realizado',
            data: chartData.value.values
          }, {
            name: 'Meta',
            data: chartData.value.goal_values
          }]
        } else {
          chart.value.series = generateSeries(chartData.value)
        }
      } else {
        noData.value = true
      }

      hooks?.afterGetDataFunction?.(chartData.value, chart.value)
    } catch (err: any) {
      console.error(err)
      error.value = `Erro ${err?.response?.status ?? 'interno'}`
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
