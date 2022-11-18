import { defineComponent, PropType } from 'vue'
import MixinUpdateYearMonth from './MixinUpdateYearMonth'
import { ResumeBarsDTO } from 'src/store/sales/sales.types'
import { NumberUtils } from 'src/utils/number.utils'
import { AxiosResponse } from 'axios'
import { DateUtils } from 'src/utils/date.utils'

export default defineComponent({
  props: {
    cds: {
      type: Array as PropType<Array<number>>,
      required: true
    },
    yearMonth: {
      type: String,
      required: true
    },
    type: {
      type: String as PropType<'seller' | 'team'>,
      required: true
    },
    initDay: {
      type: Number,
      required: false
    },
    endDay: {
      type: Number,
      required: false
    },
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

    getDataFunction: {} as () => Promise<AxiosResponse<ResumeBarsDTO>>,
    nextGetDataFunction: {} as () => void,

    chartData: {
      cds: [],
      labels: [],
      values: [],
      goalValues: [],
      types: [],
      meta: {}
    } as ResumeBarsDTO,

    chart: {
      options: {
        chart: {
          toolbar: {
            show: false
          },
          type: 'bar'
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
          name: 'Daily Bars',
          data: [30, 40, 45, 50, 49, 60, 70, 91]
        }
      ]
    }
  }),

  computed: {
    dateLabel () {
      return DateUtils.dateLabels(this.initDay, this.endDay, this.yearMonth)
    }
  },

  methods: {
    async getData () {
      try {
        this.loading = true
        this.noData = false
        this.error = ''
        this.chartData = (await this.getDataFunction()).data
        // this.chartData.dates = DateUtils.dateToLocalDate(...this.chartData.dates as string[]) as number[]

        if (this.chartData.cds.length) {
          this.chart.options.xaxis.categories = this.chartData.labels
          this.chart.series = [{
            type: 'bar',
            name: this.seriesValueTitle,
            data: this.chartData.values
          }, {
            type: 'bar',
            name: this.seriesGoalTitle,
            data: this.chartData.goalValues
          }]
        } else {
          this.noData = true
        }
      } catch (err) {
        this.error = `Erro ${err?.response?.status ?? 'interno'}`
      } finally {
        if (this.nextGetDataFunction != null) {
          this.nextGetDataFunction()
        }
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
