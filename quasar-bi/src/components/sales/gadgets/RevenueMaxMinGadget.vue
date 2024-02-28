<template>
  <gadget-base
    :title="title"
    :loading="loading || externLoading"
    :error="error"
    :noData="noData || externNoData"
  >
    <div
      class="column justify-center full-height q-pr-md"
    >
      <div
        class="col-auto"
      >
        <div
          class="column items-end"
        >
          <span
            class="text-grey text-weight-light"
            style="font-size: 16px"
          >
            {{ date2format(max.date, 'dd/MM/yyyy') }}
          </span>
          <div class="row justify-right items-center">
            <q-icon
              name="north"
              color="positive"
              size="lg"
            />
            <span
              class="text-weight-thin"
              style="font-size: 40px"
            >
              R$ {{ number2thousand(max.value) }}
            </span>
          </div>
        </div>
      </div>

      <div
        class="col-auto"
      >
        <div
          class="column items-end"
        >
          <span
            class="text-grey text-weight-light"
            style="font-size: 14px"
          >
            {{ date2format(min.date, 'dd/MM/yyyy') }}
          </span>
          <div class="row justify-right items-center">
            <q-icon
              name="south"
              color="negative"
              size="sm"
            />
            <span
              class="text-weight-thin"
              style="font-size: 22px"
            >
              R$ {{ number2thousand(min.value) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </gadget-base>
</template>

<script lang="ts">
import { apiProvider } from 'src/boot/axios'
import GadgetBase from 'src/components/GadgetBase.vue'
// import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useGetData } from 'src/reactive/useGetData'
// import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { SortUtils } from 'src/utils/sort.utils'
import { defineComponent, PropType, computed } from 'vue'
import { DateUtils } from 'src/utils/date.utils'

export default defineComponent({
  components: { GadgetBase },

  props: {
    code: { type: Number, required: false },
    yearMonth: { type: String, required: false },
    type: { type: String as PropType<'seller' | 'team'>, required: false },
    title: { type: String, default: 'Melhor e pior faturamento diário' },
    externNoData: { type: Boolean, default: false },
    externLoading: { type: Boolean, default: false }
  },

  setup (props) {
    const dataFunction = async (): Promise<any> => {
      if (props.code == null) {
        return {
          codes: [],
          values: []
        }
      }
      const { data } = await apiProvider.axios.get<any>('/bi/sales/revenue/revenue-daily-chart', {
        params: {
          cd: props.code,
          type: props.type,
          'year-month': props.yearMonth,
          cumulative: false
        }
      })
      let { maxIndex, minIndex } = SortUtils.getMinMax<number>(data.values)
      if (minIndex === -1) minIndex = 0
      if (maxIndex === -1) maxIndex = 0
      return {
        max: { date: DateUtils.dateToLocalDate(data.dates[maxIndex]), value: data.values[maxIndex] },
        min: { date: DateUtils.dateToLocalDate(data.dates[minIndex]), value: data.values[minIndex] },
        values: data.values
      }
    }
    const checkNoData = ({ values }: any) => { return values.length === 0 }
    const { loading, noData, error, data, getData } = useGetData(dataFunction, checkNoData)
    const updateProps = () => {
      if (props.externNoData === false) {
        getData()
      }
    }

    // onMounted(() => getData())
    // watch(yearMonth, value => emit('next-state-year-month', value))
    // watch(teamHeader, value => emit('next-state-team', value))
    return {
      loading,
      noData,
      error,
      data,
      max: computed(() => data.value?.max ?? { date: 0, value: 0 }),
      min: computed(() => data.value?.min ?? { date: 0, value: 0 }),
      updateProps
    }
  }
})
</script>
