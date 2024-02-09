import { addMonths, format } from 'date-fns'
import { ref, computed } from 'vue'
import { useAuth } from './UseAuth'
import mitt from 'mitt'

type Events = {
  updateYearMonthDropdown: void
}

const YearMonthDropdownEmitter = mitt<Events>()

const dates = ref([] as Date[])
const date = ref(new Date())
export const yearMonth = ref(undefined as string | undefined)

const init = () => {
  const { currentYearMonth } = useAuth()
  if (!yearMonth.value && currentYearMonth.value) {
    yearMonth.value = currentYearMonth.value
  }

  if (dates.value?.length <= 0) {
    const dateIterator = new Date(`${yearMonth.value}-01 00:00`)
    dates.value = [0, 1, 2, 3, 4, 5].map(value => addMonths(dateIterator, -value))
    updateSelected(0)
  }
}

const updateSelected = (index: number) => {
  date.value = dates.value[index]
  yearMonth.value = format(date.value as Date, 'yyyy-MM')
  YearMonthDropdownEmitter.emit('updateYearMonthDropdown')
}

export const useYearMonthDropdown = () => ({
  YearMonthDropdownEmitter,
  date: computed(() => date.value),
  dates: computed(() => dates.value),
  yearMonth: computed(() => yearMonth.value),
  init,
  updateSelected
})
