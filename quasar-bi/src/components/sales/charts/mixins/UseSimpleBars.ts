import { ref, Ref } from 'vue'
import { AxiosResponse } from 'axios'
import { NumberUtils } from 'src/utils/number.utils'
import { cloneDeep } from 'lodash'
import { IBaseChart } from 'src/dtos/sales/revenue.dto'

const chartScaffold = {
  options: {
    chart: {
      toolbar: {
        show: false
      },
      type: 'bar',
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

export const useSimpleBars = <T extends IBaseChart>(
  getDataFunction: () => Promise<AxiosResponse<T>>,
  generateSeries?: (dto: T) => any,
  nextGetDataFunction?: (dto: T) => void
) => {
  const noData = ref(false) as Ref<boolean>
  const loading = ref(false) as Ref<boolean>
  const error = ref(undefined) as Ref<string | undefined>
  const chartData = ref({
    values: [],
    labels: []
  }) as Ref<T>
  const chart = ref(cloneDeep(chartScaffold)) as Ref<any>
  const seriesValueTitle = ref('Series Value Title')
  const seriesGoalTitle = ref('Series Date Title')

  const getData = async () => {
    try {
      loading.value = true
      noData.value = false
      error.value = undefined
      chartData.value = (await getDataFunction()).data

      if (chartData.value.values.length) {
        if (generateSeries == null) {
          chart.value.series = [{
            name: 'Quantidade',
            data: chartData.value.values
          }]
          chart.value.options.labels = chartData.value.labels
          // chart.value.options.xaxis.categories = chartData.value.labels
        } else {
          chart.value.series = generateSeries(chartData.value)
        }
        chart.value.options.labels = chartData.value.labels
      } else {
        noData.value = true
      }

      if (nextGetDataFunction) {
        nextGetDataFunction(chartData.value)
      }
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
