import { defineComponent } from 'vue'
import MixinUpdateYearMonth from './MixinUpdateYearMonth'
import { DailyBarsDTO } from 'src/store/sales/sales.types'
import { DateUtils } from 'src/utils/date.utils'
import { NumberUtils } from 'src/utils/number.utils'
import { AxiosResponse } from 'axios'

export default defineComponent({
  props: {
    stateCount: {
      type: Number,
      default: 0
    }
  },

  mixins: [MixinUpdateYearMonth],

  data: () => ({
    seriesValueTitle: 'Series Value Title',
    seriesGoalTitle: 'Series Date Title',
    loading: true,
    noData: true,
    error: '',

    getDataFunction: {} as () => Promise<AxiosResponse<DailyBarsDTO>>,
    nextGetDataFunction: {} as () => void,

    chartData: {
      values: [],
      goalValues: [],
      goal: 0,
      dates: [],
      meta: {}
    } as DailyBarsDTO,

    chart: {
      options: {
        labels: {},
        chart: {
          toolbar: {
            show: false
          },
          type: 'line',
          zoom: {
            enabled: false
          }
        },
        tooltip: {
          x: {
            formatter: DateUtils.date2DayAndWeekday
          },
          y: {
            formatter: NumberUtils.number2currency
          }
        },
        stroke: {
          width: [0, 3]
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
        xaxis: {
          tooltip: {
            enabled: false
          },
          type: undefined as string | undefined, // 'datetime',
          labels: {
            formatter: undefined as ((value: number) => string) | undefined
          }
        },
        dataLabels: {
          enabled: false
        }
      },
      series: [
        {
          type: 'bar',
          name: 'Daily Bars',
          data: [30, 40, 45, 50, 49, 60, 70, 91]
        }
      ]
    }
  }),

  methods: {
    async getData () {
      try {
        this.loading = true
        this.noData = false
        this.error = ''
        this.chartData = (await this.getDataFunction()).data
        this.chartData.dates = DateUtils.dateToLocalDate(...this.chartData.dates as string[]) as number[]

        if (this.chartData.dates.length) {
          this.chart.options.labels = this.chartData.dates
          this.chart.series = [{
            type: 'bar',
            name: this.seriesValueTitle,
            data: this.chartData.values
          }, {
            type: 'line',
            name: this.seriesGoalTitle,
            data: this.chartData.goalValues
          }]
        } else {
          this.noData = true
        }
      } catch (err: any) {
        this.error = `Erro ${err?.response?.status ?? 'interno'}`
      } finally {
        this.nextGetDataFunction()
        this.loading = false
      }
    },

    async updateProps () {
      await this.getData()
    }
  },

  mounted () {
    this.getData()
  }
})
