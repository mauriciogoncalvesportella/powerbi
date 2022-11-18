<template>
  <div
    class="column"
  >
    <div
      class="col-12 full-width full-height"
      style="position: relative"
    >
      <q-linear-progress
        v-show="loading"
        style="position: absolute; top: 0; z-index: 100"
        color="white"
        indeterminate
      />
    </div>
    <div
      class="col-12"
    >
      <q-infinite-scroll
        :offset="250"
        @load="onLoad"
      >
        <q-markup-table
          square
        >
          <thead
            class="bg-primary text-white"
          >
            <tr>
              <th
                class="text-left"
                width="55%"
              >
                <q-icon
                  color="white"
                  size="sm"
                  class="cursor-pointer"
                  :name="getIcon(0)"
                  @click="onClickSort(0)"
                />
                Cliente
              </th>
              <th
                class="text-right"
                width="10%"
              >
                <q-icon
                  color="white"
                  size="sm"
                  class="cursor-pointer"
                  :name="getIcon(1)"
                  @click="onClickSort(1)"
                />
                Total de Vendas
              </th>
              <th
                class="text-right"
                width="10%"
              >
                Ticket Médio
              </th>
              <th
                v-for="month in monthLabels.slice().reverse()"
                :key="month"
                class="text-center"
                width="5%"
              >
                {{ month }}.
              </th>
              <th
                class="text-center"
                width="20%"
              >
                <q-icon
                  color="white"
                  size="sm"
                  class="cursor-pointer"
                  name="change_circle"
                  @click="toggleCurrentColorOption()"
                >
                  <q-tooltip>
                    {{ currentColorOptionIndex === 1 ? 'Usar Valor Fixo' : 'Usar Proporcional' }}
                  </q-tooltip>
                </q-icon>
                {{ currentColorOptionIndex === 0 ? 'Atual Fixo' : 'Atual Prop.' }}
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-grey-3"
          >
            <tr
              v-for="(item, index) in data"
              :key="item.customer_code"
            >
              <td
                :class="`text-left ${item.status !== 1 ? 'text-red' : ''}`"
                width="55%"
              >
                <span
                  class="cursor-pointer"
                  @click="$emit('open-customer-dialog', item.customer_code)"
                >
                  {{ item.customer_name }}
                </span>
                <q-chip
                  label
                >
                  {{ item.seller_name }}
                </q-chip>
              </td>
              <td
                class="text-right cursor-pointer"
                width="10%"
                @click="$emit('open-order-dialog', { customerCode: item.customer_code })"
              >
                {{ number2currency(item.total_amount - item.current_amount, true) }}
              </td>
              <td
                class="text-right"
                width="10%"
              >
                {{ number2currency((item.total_amount - item.current_amount) / item.count, true) }}
              </td>
              <td
                v-for="yearMonth in yearMonthArr.slice().reverse()"
                :key="yearMonth"
                class="text-center"
                width="5%"
              >
                <q-icon
                  name="circle"
                  :id="`${item.customer_code}_${yearMonth}`"
                  :color="color(yearMonth, item.monthly, item.create_date)"
                  @click="emitOpenOrderDialog(index, item.customer_code, yearMonth)"
                >
                  <q-tooltip
                    v-if="item.monthly[yearMonth]"
                    class="bg-black"
                  >
                    {{ number2currency(item.monthly[yearMonth]) }}
                  </q-tooltip>
                </q-icon>
              </td>
              <td
                class="text-center"
                width="20%"
              >
                <q-icon
                  name="circle"
                  v-if="item.current_amount === 0"
                  :color="getCurrentColor(item)"
                />
                <q-chip
                  v-else
                  dark
                  dense
                  square
                  clickable
                  :color="getCurrentColor(item)"
                  @click="emitOpenOrderDialog(index, item.customer_code, currentYearMonth)"
                >
                  {{ number2currency(item.current_amount, true) }}
                </q-chip>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
        <template
          v-if="!loadedAll"
          v-slot:loading
        >
          <div class="row justify-center q-my-md">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
      </q-infinite-scroll>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { LinearityPerCustomerDTO, LinearityPerCustomerItem } from 'src/dtos/sales/linearity.dto'
import { useLinearity } from 'src/reactive/UseLinearity'
import { useAuth } from 'src/reactive/UseAuth'
import { DateUtils } from 'src/utils/date.utils'

export default defineComponent({
  props: {
    data: {
      type: Array as PropType<LinearityPerCustomerDTO>,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    },
    loadedAll: {
      type: Boolean,
      required: true
    }
  },

  emits: [
    'on-load',
    'open-customer-dialog',
    'open-order-dialog'
  ],

  setup (props, { emit }) {
    const currentYearMonth = useAuth().currentYearMonth
    const closeDay = useAuth().user.value?.dtFechamento
    const monthRatio = DateUtils.monthRatio(undefined, undefined, currentYearMonth.value, closeDay)
    const tooltipValue = ref(-1)
    const { monthLabels, yearMonthArr, toggleSortOption, sortOptionIndex, sortIndex, setSort, toggleCurrentColorOption, currentColorOptionIndex } = useLinearity()
    const onLoad = (index: number, done: any) => emit('on-load', done) // loadData().then(() => done())

    const color = (yearMonth: string, monthlyObj: Record<string, { cost_value: number, profit_value: number, not_billed: number, billed: number }>, createDate: string) => {
      if (monthlyObj[yearMonth]) {
        return 'green'
      } else if (yearMonth < createDate) {
        return 'black'
      }
      return 'red'
    }

    const getIcon = (index: number) => {
      if (index === sortIndex.value) {
        return sortOptionIndex.value === 0 ? 'arrow_upward' : 'arrow_downward'
      }
      return 'mobiledata_off'
    }

    const onClickSort = (index: number) => {
      if (sortIndex.value !== index) {
        setSort(index)
      } else {
        toggleSortOption()
      }
    }

    const getCurrentColor = (linearity: LinearityPerCustomerItem): string => {
      const _monthRatio = currentColorOptionIndex.value === 1
        ? monthRatio
        : 1
      const average = ((linearity.total_amount - linearity.current_amount) / linearity.count) * _monthRatio
      const current = linearity.current_amount
      const radio = current / average

      if (radio >= 1.2) {
        return 'blue'
      }

      if (radio >= 0.8) {
        return 'green'
      }

      if (radio >= 0.5) {
        return 'orange'
      }

      return 'red'
    }

    const emitOpenOrderDialog = (customerIndex: number, customerCode: number, start?: string, end?: string) => {
      if (start && !end) {
        if (!props.data[customerIndex].monthly[start]) {
          return
        }
      }

      emit('open-order-dialog', {
        customerCode,
        start,
        end
      })
    }

    return {
      sortIndex,
      setSort,
      onClickSort,
      getIcon,
      toggleSortOption,
      onLoad,
      monthLabels,
      color,
      getCurrentColor,
      tooltipValue,
      currentYearMonth,
      emitOpenOrderDialog,
      toggleCurrentColorOption,
      currentColorOptionIndex,
      yearMonthArr
    }
  }
})
</script>
