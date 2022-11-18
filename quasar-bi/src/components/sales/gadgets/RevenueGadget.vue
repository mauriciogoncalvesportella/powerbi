<template>
  <gadget-base
    ref="gadgetBase"
    :title="title"
    :noData="noData || externNoData"
    :error="error"
    :loading="loading || externLoading"
  >
    <!--template
      v-slot:header
    >
      <q-badge
        outline
        color="primary"
      >
        <q-icon name="event" color="primary" />
        <span
          class="ellipsis"
          style="max-width: 80px; padding-left: 3px"
        >
          {{ yearMonth2format(yearMonth ?? '2021-01', 'MMM yy') }}
        </span>
      </q-badge>
    </template-->

    <div
      class="text-caption text-right q-px-sm full-height column justify-center"
    >
      <span
        id="customValue"
        class="text-weight-thin"
        style="font-size: 42px"
      >
        <q-icon
          :name="value >= goalValue ? 'north' : 'south'"
          :color="value >= goalValue ? 'primary' : 'red'"
        />
        R$ {{ number2thousand(value) }}
      </span>
      <div
        class="column text-subtitle2 text-grey text-weight-light"
        style="font-size: 16px"
      >
        Meta Mensal
        R$ {{ number2thousand(goalValue) }}
      </div>
      <div
        class="column text-subtitle2 text-grey text-weight-light"
        style="font-size: 16px"
      >
        Média venda diária
        R$ {{ number2thousand(averageValue) }}
      </div>
      <div
        class="column text-subtitle2 text-grey text-weight-light"
        style="font-size: 16px"
      >
        Meta diária
        R$ {{ number2thousand(averageGoalValue) }}
      </div>
      <div
        v-if="monthlyGoalValue != goalValue"
        class="column text-subtitle2 text-grey text-weight-light"
        style="font-size: 16px"
      >
        Meta mensal
        R$ {{ number2thousand(monthlyGoalValue) }}
      </div>
    </div>
  </gadget-base>
</template>

<script lang="ts">
import { apiProvider } from 'src/boot/axios'
import { ref, Ref, defineComponent, PropType, computed } from 'vue'
import { useGetData } from 'src/reactive/useGetData'
// import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { DailyBarsUtils } from 'src/utils/daily-bars.utils'
import GadgetBase from 'src/components/GadgetBase.vue'
import { RevenueDailyDTO } from 'src/dtos/sales/revenue.dto'
import { DateUtils } from 'src/utils/date.utils'

export default defineComponent({
  components: { GadgetBase },
  props: {
    code: {
      type: Number as PropType<number | undefined>,
      required: false
    },
    type: {
      type: String as PropType<'seller' | 'team'>,
      required: false
    },
    yearMonth: {
      type: String,
      required: false
    },
    title: {
      type: String,
      default: 'Faturamento mensal'
    },
    externNoData: {
      type: Boolean,
      default: false
    },
    externLoading: {
      type: Boolean,
      default: false
    }
  },

  setup (props) {
    // const { team: teamHeader } = useTeamDropdown()
    // const { yearMonth } = useYearMonthDropdown()
    const gadgetBase: Ref<any> = ref(null)
    const noDataFunction = (data: any) => data.noData
    const dataFunction = async (): Promise<any> => {
      const response = await apiProvider.axios.get<RevenueDailyDTO>('/bi/sales/profit/revenue-daily-chart', {
        params: {
          cd: props.code,
          type: props.type,
          'year-month': props.yearMonth,
          cumulative: true
        }
      })

      response.data.dates = DateUtils.datesToLocalDate(response.data.dates as string[])
      const { index, countDays } = DailyBarsUtils.getMonthIndex(response.data)
      return {
        averageValue: response.data.values[index] / countDays,
        averageGoalValue: response.data.goal_values[0],
        value: response.data.values[index],
        goalValue: response.data.goal_values[index],
        monthlyGoalValue: response.data.goal_values[response.data.dates.length - 1],
        notBilled: response.data.not_billed[index],
        noData: response.data.values.findIndex(item => item > 0) === -1
      }
    }

    const { loading, noData, error, data, getData } = useGetData(dataFunction, noDataFunction)

    const updateProps = () => {
      if (!props.externNoData) {
        getData()
      }
    }

    /*
    onMounted(() => {
      getData()
    })
    */
    // watch(teamHeader, (value) => emit('next-state-team', value))
    // watch(yearMonth, (value) => emit('next-state-year-month', value))

    return {
      gadgetBase,
      noData,
      error,
      loading,
      value: computed(() => data.value?.value ?? 0),
      goalValue: computed(() => data.value?.goalValue ?? 0),
      averageValue: computed(() => data.value?.averageValue ?? 0),
      monthlyGoalValue: computed(() => data.value?.monthlyGoalValue ?? 0),
      averageGoalValue: computed(() => data.value?.averageGoalValue ?? 0),
      updateProps
    }
  }
})
</script>
