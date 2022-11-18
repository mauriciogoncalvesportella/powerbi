import { addMonths, format } from 'date-fns'
import { ref, computed } from 'vue'
import { emitter } from 'src/events'

const dates = ref([] as Date[])
const date = ref(new Date())
const yearMonth = ref(undefined as string | undefined)

const init = (yearMonth: string) => {
  if (dates.value?.length <= 0) {
    const dateIterator = new Date(`${yearMonth}-01 00:00`)
    dates.value = [0, 1, 2, 3, 4, 5].map(value => addMonths(dateIterator, -value))
    updateSelected(0)
  }
}

const updateSelected = (index: number) => {
  date.value = dates.value[index]
  yearMonth.value = format(date.value as Date, 'yyyy-MM')
  emitter.emit('updateYearMonthHeader', yearMonth.value)
}

export function useYearMonthDropdown () {
  return {
    date: computed(() => date.value),
    dates: computed(() => dates.value),
    yearMonth: computed(() => yearMonth.value),
    init,
    updateSelected
  }
}
