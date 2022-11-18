<template>
  <gadget-base
    :title="title"
    :noData="noData"
    :error="error"
    :loading="loading"
  >
    <template
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
          {{ yearMonth2format(yearMonth, 'MMM yy') }}
        </span>
      </q-badge>
      <!--q-badge
        v-if="label"
        outline
        color="primary"
      >
        <q-icon name="groups" color="primary" />
        <span
          class="ellipsis"
          style="max-width: 80px; padding-left: 3px"
        >
          {{ label }}
        </span>
      </q-badge-->
    </template>

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
        style="font-size: 18px"
      >
        Meta
        R$ {{ number2thousand(goalValue) }}
      </div>
      <div
        class="column text-subtitle2 text-grey text-weight-light"
        style="font-size: 18px"
      >
        Média
        R$ {{ number2thousand(averageValue) }}
      </div>
    </div>
  </gadget-base>
</template>

<script lang="ts">
import { apiProvider } from 'src/boot/axios'
import { defineComponent, PropType, onMounted, computed, watch } from 'vue'
import { useGetData } from 'src/reactive/useGetData'
import { useTeamDropdown } from 'src/reactive/TeamDropdown'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { format } from 'date-fns'
import GadgetBase from 'src/components/GadgetBase.vue'

export default defineComponent({
  components: { GadgetBase },
  props: {
    cd: {
      type: Number,
      required: true
    },
    type: {
      type: String as PropType<'seller' | 'team'>,
      required: true
    },
    yearMonth: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: 'Faturamento mensal'
    }
  },

  setup (props, { emit }) {
    const { teamHeader } = useTeamDropdown()
    const { yearMonth } = useYearMonthDropdown()
    const todayDate = format(new Date(), 'yyyy-MM-dd')

    const noDataFunction = (data: any) => data.noData
    const dataFunction = async (): Promise<any> => {
      const url = '/bi/sales/revenue/daily-chart'
      const options = {
        params: {
          cds: [props.cd],
          yearMonth: props.yearMonth,
          type: props.type,
          accumulated: true
        }
      }

      const response = await apiProvider.axios.get<any>(url, options)

      let index = response.data.values?.length - 1
      let count = 0
      if (response.data.values.length > 0) {
        for (let i = 0; i < response.data.values.length; i++) {
          if (response.data.dates[i] === todayDate) {
            index = i
          }
          if (response.data.values[i] > 0) {
            count++
          }
        }

        if (index === -1) {
          throw new Error('RevenueGadget: index not found')
        }
      }

      return {
        averageValue: response.data.values[index] / count,
        value: response.data.values[index],
        goalValue: response.data.goalValues[index],
        noData: response.data.values.length === 0
      }
    }

    const { loading, noData, error, data, getData } = useGetData(dataFunction, noDataFunction)

    const updateProps = () => {
      getData()
    }

    onMounted(() => {
      getData()
    })

    watch(teamHeader, (value) => {
      emit('next-state-team', value)
    })

    watch(yearMonth, (value) => {
      emit('next-state-year-month', value)
    })

    return {
      noData,
      error,
      loading,
      // label: computed(() => data.value?.labels[0]),
      value: computed(() => data.value?.value ?? 0),
      goalValue: computed(() => data.value?.goalValue ?? 0),
      averageValue: computed(() => data.value?.averageValue ?? 0),
      updateProps
    }
  }
})
</script>
