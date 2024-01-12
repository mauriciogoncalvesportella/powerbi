<template>
  <div id="linearity-list-scroll-id" class="q-pa-md" style="max-height: 500px; overflow: auto;">
    <q-infinite-scroll
      :offset="250"
      scroll-target="linearity-list-scroll-id"
      @load="onLoad"
    >
      <q-list
        bordered
        separator
      >
        <q-item
          v-for="item in data.data"
          :key="item.customer_code"
        >
          <q-item-section>
            <q-item-label
              :class="`text-weight-bold ${item.status !== 1 ? 'text-red' : ''}`"
            >
              {{ item.customer_name }}
            </q-item-label>
            <q-item-label>
              <q-chip
                :label="number2currency(item.total_amount - item.current_amount)"
                dense
                square
                dark
                color="primary"
              />
              <q-chip
                :label="number2currency((item.total_amount - item.current_amount) > 0 ? (item.total_amount + item.current_amount) / item.count : 0)"
                dense
                square
                dark
                color="secondary"
              />
            </q-item-label>
            <q-item-label
              class="lt-sm"
            >
              <div
                class="row"
              >
                {{ yearMonthArr }}
                <div
                  v-for="(yearMonth, index) in yearMonthArr.slice().reverse()"
                  :key="yearMonth"
                  :class="`text-white q-pa-xs q-ma-xs rounded-borders bg-${getColor(yearMonth, item.monthly, item.create_date)}`"
                  square
                >
                  {{ monthLabels[index] }}
                </div>
                <div
                  :class="`text-white q-pa-xs q-ma-xs rounded-borders ${item.current_amount > 0 ? 'bg-green' : 'bg-red'}`"
                >
                  {{ item.current_amount == 0 ? 'atual' : number2currency(item.current_amount, true) }}
                </div>
              </div>
            </q-item-label>
          </q-item-section>
          <q-item-section
            class="gt-xs"
            side
            top
          >
            <div
              class="row"
            >
              <div
                v-for="(yearMonth, index) in yearMonthArr.slice().reverse()"
                :key="yearMonth"
                :class="`text-white q-pa-xs q-ma-xs rounded-borders bg-${getColor(yearMonth, item.monthly, item.create_date)}`"
              >
                {{ monthLabels[index] }}
              </div>
              <div
                :class="`text-white q-pa-xs q-ma-xs rounded-borders ${item.current_amount > 0 ? 'bg-green' : 'bg-red'}`"
              >
                {{ item.current_amount == 0 ? 'atual' : number2currency(item.current_amount, true) }}
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
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
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { LinearityPerCustomerDTO } from 'src/dtos/sales/linearity.dto'
import { useLinearity } from 'src/reactive/UseLinearity'

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<LinearityPerCustomerDTO>,
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
    'on-load'
  ],

  setup (_, { emit }) {
    const { monthLabels, yearMonthArr, getColor } = useLinearity()
    const onLoad = (index: number, done: any) => {
      emit('on-load', { done, clear: false }) // loadData().then(() => done())
    }

    return {
      getColor,
      onLoad,
      monthLabels,
      yearMonthArr
    }
  }
})
</script>
