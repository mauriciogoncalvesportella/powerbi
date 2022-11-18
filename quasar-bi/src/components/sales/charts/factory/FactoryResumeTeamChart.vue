<template>
  <chart-base
    ref="chartComponent"
    title="Resumo por Equipe"
    :no-data="noData || externNoData"
    :apex-options="chart.options"
    :apex-series="chart.series"
    :loading="(loading || externLoading) && !externNoData"
    :erorr="error"
    :state-count="stateCount"
    @data-point-selection="nextState"
  >
    <template
      v-slot:header
    >
      <q-scroll-area
        style="height: 38px"
        class="full-width"
        :thumb-style="{ right: '2px', borderRadius: '5px', width: '2px', height: '8px', opacity: .25 }"
      >
        <div
          class="row no-wrap"
        >
          <q-chip
            v-show="factoryProps.code != null"
            :icon="menu === 'category' ? 'category' : 'build'"
            size="11.5px"
            square
            :label="factoryProps.label"
          />
        </div>
      </q-scroll-area>
    </template>
  </chart-base>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import ChartBase from 'components/ChartBase.vue'
import { useSimpleBars } from '../mixins/UseSimpleBars'
import { ResumeTeamByFactoryDTO } from 'src/dtos/sales/factory.dto'
import { apiProvider } from 'src/boot/axios'
import { AxiosResponse } from 'axios'

export default defineComponent({
  components: {
    ChartBase
  },

  emits: ['data-select', 'next-state', 'nextState'],

  props: {
    menu: { type: String as PropType<'factory' | 'category'>, default: 'factory' },
    code: { type: Number, required: false },
    yearMonth: { type: String, required: false },
    factoryProps: {
      type: Object as PropType<{ code: number | null, label: string | null }>,
      default: () => ({ code: null, label: null })
    },
    externLoading: { type: Boolean, default: false },
    externNoData: { type: Boolean, default: false },
    stateCount: { type: Number, default: 0 }
  },

  setup (props, { emit }) {
    const getDataFunction = async () => {
      if (props.factoryProps.code != null && !props.externNoData) {
        return await apiProvider.axios.get<ResumeTeamByFactoryDTO>(`bi/sales/${props.menu}/resume-team-by-factory`, {
          params: {
            cd: props.code,
            'factory-code': props.factoryProps.code,
            'year-month': props.yearMonth
          }
        })
      }

      return {
        data: {
          codes: [],
          types: [],
          total_orders: [],
          values: [],
          labels: []
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {}
      } as AxiosResponse<ResumeTeamByFactoryDTO>
    }

    const {
      noData,
      loading,
      error,
      chartData,
      chart,
      getData
    } = useSimpleBars<ResumeTeamByFactoryDTO>(getDataFunction)

    const updateProps = () => {
      if (!props.externNoData) {
        getData()
      }
    }

    const nextState = (event: any, chartContext: any, { dataPointIndex }: any) => {
      const code = chartData.value?.codes[dataPointIndex]
      const type = chartData.value?.types[dataPointIndex]
      const label = chartData.value?.labels[dataPointIndex]
      if (chartData.value.types[dataPointIndex] === 'team') {
        emit('nextState', {
          component: 'FactoryResumeTeamChart',
          props: {
            menu: props.menu,
            code,
            type,
            yearMonth: props.yearMonth,
            factoryProps: {
              code: props.factoryProps.code,
              label: props.factoryProps.label
            }
          }
        })
      }
      emit('data-select', {
        code,
        type,
        label
      })
    }

    return {
      noData: computed(() => props.factoryProps.code == null || noData.value),
      nextState,
      loading,
      error,
      chartData,
      chart,
      getData,
      updateProps
    }
  }
})
</script>
