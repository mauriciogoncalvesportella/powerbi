<template>
  <q-btn-dropdown
    color="primary"
    class="full-width"
    push
  >
    <template v-slot:label>
      <div
        class="row full-width"
      >
        {{ $filters.date2monthname(date) }}
        <q-space />
        <div
          v-if="$filters.date2format(date, 'yyyy') !== $filters.date2format(new Date(), 'yyyy')"
        >
          {{ $filters.date2format(date, 'yyyy') }}
        </div>
      </div>
    </template>
    <q-list>
      <q-item
        v-for="(d, index) in dates"
        :key="index"
        :disable="d === date"
        clickable
        v-close-popup
        @click="onItemClick(index)"
      >
        <q-item-section>
          <q-item-label
            class="row full-width"
          >
            {{ $filters.date2monthname(d) }}
            <q-space />
            <div
              v-if="$filters.date2format(d, 'yyyy') !== $filters.date2format(new Date(), 'yyyy')"
            >
              {{ $filters.date2format(d, 'yyyy') }}
            </div>
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { format } from 'date-fns'
import { useStore } from 'src/store'
import { useYearMonthDropdown } from 'src/reactive/YearMonthDropdown'

export default defineComponent({
  props: {
    modelValue: String
  },
  emits: ['update:modelValue'],
  setup (_, { emit }) {
    const $store = useStore()

    const { init, dates, updateSelected, date } = useYearMonthDropdown()
    init($store.getters['auth/currentYearMonth'])

    function onItemClick (index: number) {
      updateSelected(index)
      emit('update:modelValue', format(date.value as Date, 'yyyy-MM'))
    }

    onMounted(() => {
      emit('update:modelValue', format(date.value as Date, 'yyyy-MM'))
    })

    return {
      date,
      onItemClick,
      dates
    }
  }
})
</script>
