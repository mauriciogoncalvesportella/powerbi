<template>
  <gadget-base
    :title="title"
    :loading="loading || externLoading"
    :error="error"
    :noData="noData || externNoData"
  >
    <!--template
      v-if="yearMonth"
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
    </template-->

    <div
      class="column items-end full-height justify-center q-pr-sm"
    >
      <div
        v-for="i in length"
        :key="`team_${i}`"
        class="row items-center"
      >
        <div class="column items-end">
          <span
            class="text-grey text-weight-light ellipsis"
            :style="`font-size: ${sizes[i][0]}px; max-width: 150px`"
          >
            {{ data.labels[i] }}
          </span>
          <span
            class="text-weight-thin"
            :style="`font-size: ${sizes[i][1]}px`"
          >
            R$ {{ number2thousand(data.values[i]) }}
          </span>
        </div>
        <q-icon
          name="military_tech"
          :color="colors[i]"
          size="md"
        />
      </div>
    </div>
  </gadget-base>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import GadgetBase from 'src/components/GadgetBase.vue'
// import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
// import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'
import { apiProvider } from 'src/boot/axios'
import { useGetData } from 'src/reactive/useGetData'
import { SortUtils } from 'src/utils/sort.utils'

export default defineComponent({
  components: { GadgetBase },
  props: {
    code: { type: Number, required: false },
    yearMonth: { type: String, required: false },
    title: { type: String, default: 'Ranking faturamento' },
    externLoading: { type: Boolean, default: false },
    externNoData: { type: Boolean, default: false }
  },

  setup (props) {
    const dataFunction = async (): Promise<any> => {
      if (props.code == null) {
        return {
          cd: []
        }
      }
      const url = 'bi/sales/revenue/revenue-resume-chart'
      const options = {
        params: {
          'team-code': props.code,
          'year-month': props.yearMonth,
          type: 'team'
        }
      }
      const data = (await apiProvider.axios.get<any>(url, options)).data
      SortUtils.multiArray<any>(data.values, [data.codes, data.type, data.labels, data.billed, data.goal_values])
      return data
    }

    const { loading, noData, error, data, getData } = useGetData(dataFunction)

    const updateProps = () => {
      if (!props.externNoData) {
        getData()
      }
    }

    return {
      loading,
      noData,
      error,
      data,
      updateProps,
      sizes: computed(() => [['18', '30'], ['14', '22'], ['12', '18']]),
      colors: computed(() => ['yellow-14', 'grey-5', 'brown']),
      length: computed(() => Array.from(Array(Math.min(3, data.value?.codes.length ?? 0)).keys()))
    }
  }
})
</script>
