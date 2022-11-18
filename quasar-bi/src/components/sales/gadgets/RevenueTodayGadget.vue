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
          <div class="row justify-right items-center">
            <q-icon
              v-show="goalValue > 0"
              :name="value > goalValue ? 'north' : 'south'"
              :color="value > goalValue ? 'positive' : 'negative'"
              size="lg"
            />
            <span
              class="text-weight-thin"
              style="font-size: 40px"
            >
              R$&nbsp;{{ number2thousand(value) }}
            </span>
          </div>
          <span
            v-show="goalValue > 0"
            class="text-grey text-weight-light"
            style="font-size: 16px"
          >
            Meta&nbsp;R${{ number2thousand(goalValue) }}
          </span>
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
import { defineComponent, PropType, computed } from 'vue'
import { useStore } from 'src/store'
import { format } from 'date-fns'

export default defineComponent({
  components: { GadgetBase },
  props: {
    code: { type: Number, required: false },
    type: { type: String as PropType<'seller' | 'team'>, required: false },
    title: { type: String, default: 'Faturamento de hoje' },
    externNoData: { type: Boolean, default: false },
    externLoading: { type: Boolean, defautl: false }
  },

  setup (props) {
    const $store = useStore()
    // const { team: teamHeader } = useTeamDropdown()
    const currentYearMonth = $store.getters['auth/currentYearMonth']
    // const currentDate = `${currentYearMonth}-${format(new Date(), 'dd')}`
    const currentDate = format(new Date(), 'yyyy-MM-dd')

    const dataFunction = async (): Promise<any> => {
      if (props.code == null) {
        return {
          codes: [],
          values: []
        }
      }

      const { data } = await apiProvider.axios.get<any>('/bi/sales/profit/revenue-daily-chart', {
        params: {
          cd: props.code,
          type: props.type,
          'year-month': currentYearMonth,
          cumulative: false
        }
      })
      const index = data.dates.findIndex((date: string) => date === currentDate)
      if (index === -1 && data.values.length > 0) {
        return {
          value: 0,
          goalValue: 0,
          values: [-1]
        }
      }
      return {
        value: data.values[index] ?? -1,
        goalValue: data.goal_values[index] ?? -1,
        values: data.values
      }
    }

    const checkNoData = ({ values }: any) => values.length === 0
    const { loading, noData, error, data, getData } = useGetData(dataFunction, checkNoData)

    const updateProps = () => {
      if (!props.externNoData) {
        getData()
      }
    }
    // watch(teamHeader, value => emit('next-state-team', value))

    return {
      loading,
      noData,
      error,
      data,
      value: computed(() => data.value?.value ?? 0),
      goalValue: computed(() => data.value?.goalValue ?? 0),
      updateProps
    }
  }
})
</script>
