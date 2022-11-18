<template>
  <chart-base
    ref="chartComponent"
    title="Venda por Equipe"
    :apex-options="chart.options"
    :apex-series="chart.series"
    :loading="loading"
    :no-data="noData"
    :error="error"
    :state-count="stateCount"
    filter-disabled
  />
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue'
import ChartBase from 'components/ChartBase.vue'
import { useSimpleBars } from '../mixins/UseSimpleBars'
import { ResumeTeamByFactoryDTO } from 'src/dtos/sales/factory.dto'
import { apiProvider } from 'src/boot/axios'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'

export default defineComponent({
  components: {
    ChartBase
  },

  props: {
    menu: { type: String as PropType<'factory' | 'category'>, default: 'factory' },
    cd: { type: Number, required: true },
    type: { type: String, required: true },
    factoryCode: { type: String, required: true },
    stateCount: { type: Number, default: 0 }
  },

  setup (props) {
    const { yearMonth } = useYearMonthDropdown()

    const getDataFunction = async () => {
      return await apiProvider.axios.get<ResumeTeamByFactoryDTO>(`bi/sales/${props.menu}/rusume-team-by-factory`, {
        params: {
          cd: props.cd,
          'factory-code': props.factoryCode,
          type: props.type,
          'year-month': yearMonth.value
        }
      })
    }

    const {
      noData,
      loading,
      error,
      chartData,
      getData,
      updateProps
    } = useSimpleBars<ResumeTeamByFactoryDTO>(getDataFunction)

    return {
      noData,
      loading,
      error,
      chartData,
      getData,
      updateProps
    }
  }
})
</script>
