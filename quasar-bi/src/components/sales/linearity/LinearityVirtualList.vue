<template>
  <div class="row no-wrap q-gutter-x-md q-pa-sm">
    <q-select style="width: 150px" v-model="sortByColumnModel" :options="sortByColumnsOptions" label="Coluna" @update:model-value="onSelectChange" />
    <q-select style="width: 150px" v-model="sortDescendingModel" :options="sortDescendingOptions" label="Ordenação" @update:model-value="onSelectChange" />
    <q-select style="width: 150px" v-model="selectCurrentAmountColorModel" :options="selectCurrentAmountColorOptions" label="Faturamento Atual" @update:model-value="toggleCurrentColorOption"/>
  </div>
  <div id="linearity-virtual-list-target" style="height: calc(100svh - 50px - 56px - 80px); overflow-y: scroll">
    <q-infinite-scroll @load="onLoad" :offset="100" scroll-target="#linearity-virtual-list-target">
      <q-markup-table class="transparent">
        <tbody>
          <template
            v-for="item in data.data"
            :key="item.customer_code"
            dense
            flat
          >
            <tr class="text-left">
              <td colspan="8" class="text-weight-bolder text-h6" style="position: sticky; left: 0;">
                <span class="text-weight-bold text-subtitle2">
                  {{ item.customer_name }}
                </span>
              </td>
            </tr>
            <tr>
              <td class="text-right"> Total </td>
              <td class="text-right"> Ticket Médio </td>
              <td
                v-for="label in monthLabels"
                :key="label"
                class="text-right"
              >
                {{ label }}
              </td>
              <td class="text-right"> Atual </td>
            </tr>
            <tr>
              <td
                class="text-right"
              >
                {{ number2currency(item.total_amount - item.current_amount, true) }}
              </td>
              <td class="text-right"> {{ number2currency((item.total_amount - item.current_amount) > 0 ? (item.total_amount + item.current_amount) / item.count : 0, true) }} </td>
              <td
                v-for="yearMonthId in yearMonthArr"
                :key="yearMonthId"
                class="text-right"
                :class="`${color(yearMonthId, item.monthly, item.create_date)}`"
              >
                {{ number2currency(item.monthly[yearMonthId], true) }}
              </td>
              <td class="text-right" :class="getColorCurrentAmount(item)"> {{ number2currency(item.current_amount, true) }} </td>
            </tr>
          </template>
        </tbody>
      </q-markup-table>
      <hr/>
      <template v-slot:loading>
        <div class="row justify-center q-my-md">
          <q-spinner-dots color="primary" size="40px" />
        </div>
      </template>
    </q-infinite-scroll>
  </div>
</template>
<script lang="ts">
import { LinearityPerCustomerDTO } from 'src/dtos/sales/linearity.dto'
import { useLinearity } from 'src/reactive/UseLinearity'
import { PropType, defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<LinearityPerCustomerDTO>,
      required: true
    }
  },
  emits: ['on-load'],
  setup (_, { emit }) {
    const { monthLabels, yearMonthArr, getColor, sortByColumn, sortDescending, toggleCurrentColorOption, getColorCurrentAmount } = useLinearity()
    const sortByColumnModel = ref({ label: 'Cliente', value: 'customer_name' })
    const sortByColumnsOptions = [
      { label: 'Cliente', value: 'customer_name' },
      { label: 'Fat. Total', value: 'total_amount' },
      { label: 'Ticket Médio', value: 'average_amount' },
      { label: `Fat. ${monthLabels.value[0]}`, value: yearMonthArr.value[0] },
      { label: `Fat. ${monthLabels.value[1]}`, value: yearMonthArr.value[1] },
      { label: `Fat. ${monthLabels.value[2]}`, value: yearMonthArr.value[2] },
      { label: `Fat. ${monthLabels.value[3]}`, value: yearMonthArr.value[3] },
      { label: `Fat. ${monthLabels.value[4]}`, value: yearMonthArr.value[4] },
      { label: 'Fat. Atual', value: 'current_amount' }
    ]
    const sortDescendingOptions = [{ label: 'Ascendente', value: false }, { label: 'Descendente', value: true }]
    const sortDescendingModel = ref({ label: 'Ascendente', value: false })
    const selectCurrentAmountColorOptions = [{ label: 'Atual Fixo', value: 0 }, { label: 'Atual Prop.', value: 1 }]
    const selectCurrentAmountColorModel = ref({ label: 'Atual Fixo', value: 0 })

    const onSelectChange = () => {
      sortByColumn.value = sortByColumnModel.value.value
      sortDescending.value = sortDescendingModel.value.value
      const done = () => 0
      emit('on-load', { done, clear: true })
    }

    const items = ref([{}, {}, {}, {}, {}, {}, {}])

    const color = (yearMonthColumn: string, monthlyObj: Record<string, number>, createDate: string) => {
      if (monthlyObj[yearMonthColumn] && monthlyObj[yearMonthColumn] > 0) {
        return 'bg-green-2'
      } else if (yearMonthColumn < createDate) {
        return 'bg-grey-5'
      }
      return 'bg-red-3'
    }

    return {
      selectCurrentAmountColorOptions,
      selectCurrentAmountColorModel,
      sortByColumnModel,
      sortByColumnsOptions,
      sortDescendingModel,
      sortDescendingOptions,
      getColorCurrentAmount,
      color,
      items,
      monthLabels,
      getColor,
      yearMonthArr,
      onSelectChange,
      toggleCurrentColorOption,
      onLoad (index: number, done: any) {
        emit('on-load', { done, clear: false })
        setTimeout(() => {
          items.value.push({}, {}, {}, {}, {}, {}, {})
          done()
        }, 2000)
      }
    }
  }
})
</script>
