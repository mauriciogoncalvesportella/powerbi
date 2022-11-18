<template>
  <q-card
    square
  >
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title
        class="text-weight-light text-subtitle2"
      >
        Resumo Fabricantes Mensal
      </q-toolbar-title>
    </q-toolbar>
    <div
      style="position: relative; padding-top: 64%"
    >
      <div
        class="full-width full-height"
        style="position: absolute; top: 0; height: 100%"
      >
        <q-scroll-area
          class="full-width full-height"
          style="position: absolute; top: 0; height: 100%"
        >
          <apexchart
            class="q-pl-md q-pr-sm"
            v-show="!error && !noData"
            ref="apexchart"
            type="bar"
            :options="chartOptions"
            :series="series"
          />
        </q-scroll-area>

        <q-inner-loading
          :showing="loading || externLoading"
        >
          <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

        <div
          v-if="error"
          class="error full-width full-height"
        >
          <div
            class="row full-width full-height justify-center items-center no-data-inside"
          >
            <q-icon
              name="error"
              size="xl"
              color="negative"
            />
            <span
              class="text-weight-thin text-h6"
            >
              {{ error }}
            </span>
          </div>
        </div>
        <div
          v-else-if="noData || externNoData"
          class="column no-data justify-center items-center full-height full-width"
        >
          <q-icon
            name="cloud_off"
            color="primary"
            size="60px"
          />
          <span
            class="text-weight-light text-subtitle1 row items-center"
          >
            Sem dados no intervalo
          </span>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { apiProvider } from 'src/boot/axios'
import { defineComponent, ref, Ref, nextTick, PropType } from 'vue'
import { FactoryResumeDTO } from 'src/dtos/sales/factory.dto'
import { NumberUtils } from 'src/utils/number.utils'
import { AxiosResponse } from 'axios'

export default defineComponent({
  props: {
    menu: { type: String as PropType<'factory' | 'category'>, default: 'factory' },
    code: { type: Number, required: false },
    type: { type: String, required: false },
    yearMonth: { type: String, required: false },
    externLoading: { type: Boolean, default: false },
    externNoData: { type: Boolean, default: false }
  },

  setup (props, { emit }) {
    const chartOptions = ref({
      grid: {
        show: false,
        padding: {
          left: 0,
          right: 0,
          up: 0,
          down: 0,
          top: 0,
          bottom: 0
        }
      },
      chart: {
        id: 'FactoryResumeChart',
        type: 'bar',
        toolbar: false,
        height: 350,
        parentHeightOffset: 0,
        events: {} as any
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true
        }
      },
      tooltip: {
        enabled: false
      },
      dataLabels: {
        textAnchor: 'start',
        enabled: true,
        formatter: (n: any) => `${NumberUtils.number2currency(n)}`,
        style: {
          fontSize: '12px',
          fontWeight: 400,
          colors: ['black']
        }
      },
      xaxis: {
        categories: [] as string[],
        labels: {
          formatter: NumberUtils.number2thousand
        },
        floating: true,
        axisTicks: {
          show: false
        },
        axisBorder: {
          show: false
        }
      }
    })

    const apexchart: Ref<any> = ref(null)
    const series: Ref<any> = ref([])
    const height = ref(0)
    const chartComponent = ref(null) as Ref<any>
    let chartData: FactoryResumeDTO = {
      codes: [],
      ids: [],
      labels: [],
      values: [],
      total_orders: [],
      quantities: []
    }

    const loading = ref(false)
    const noData = ref(true)
    const error = ref(false)

    chartOptions.value.chart.events = {
      dataPointSelection: function (event: any, chartContext: any, config: any) {
        if (config.dataPointIndex >= 0) {
          const code = chartData.codes[config.dataPointIndex]
          const label = chartData.labels[config.dataPointIndex]
          if (code !== undefined) {
            emit('data-select', {
              code,
              label
            })
          }
        }
      }
    }

    const getData = async (): Promise<AxiosResponse<FactoryResumeDTO>> => {
      return await apiProvider.axios.get<FactoryResumeDTO>(`bi/sales/${props.menu}/resume`, {
        params: {
          cd: props.code,
          type: props.type,
          yearMonth: props.yearMonth
        }
      })
    }

    const plot = async () => {
      loading.value = true
      await getData()
        .then(response => {
          error.value = false
          noData.value = response.data.codes.length === 0
          chartData = response.data
          series.value = [{
            name: 'Faturamento',
            data: chartData.values
          }]
          chartOptions.value.xaxis.categories = chartData.labels
          chartOptions.value.chart.height = 100 + chartData.codes.length * 40
          nextTick(() => apexchart.value.updateOptions(chartOptions.value))
        })
        .catch(() => {
          error.value = true
        })
        .finally(() => {
          loading.value = false
          if (noData.value || error.value) {
            emit('data-select', { code: null, label: null })
          } else {
            emit('data-select', { code: chartData.codes[0], label: chartData.labels[0] })
          }
        })
    }

    const updateProps = () => {
      if (!props.externNoData) {
        plot()
      }
    }

    return {
      updateProps,
      apexchart,
      error,
      loading,
      chartOptions,
      series,
      chartData,
      chartComponent,
      noData,
      height
    }
  }
})
</script>
