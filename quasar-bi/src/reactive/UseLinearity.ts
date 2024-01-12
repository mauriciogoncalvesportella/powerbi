import { addMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ref, computed, Ref } from 'vue'
import { useAuth } from './UseAuth'
import { LinearityPerCustomerItem } from 'src/dtos/sales/linearity.dto'
import { DateUtils } from 'src/utils/date.utils'

const labels: Ref<string[]> = ref([
  'Novos',
  'Péssimo',
  'Ruim',
  'Regular',
  'Bom',
  'Excelente'
])

const currentColorOptions: Ref<string[]> = ref([
  'Valor Fixo',
  'Proporcional'
])

const auth = useAuth()

const sortDescending: Ref<boolean> = ref(false)
const sortByColumn: Ref<string> = ref('customer_name') // customer_name, amount, current_amount
const currentColorOptionIndex: Ref<number> = ref(parseInt(localStorage.getItem('currentColorOptions') ?? '0'))
const countFilter = ref(-1)

const mobileCurrentTab = ref('graphs')

const monthLabels = computed(() => {
  const currentYearMonth = auth.currentYearMonth.value
  const currentDate = new Date(`${currentYearMonth}-01 00:00`)
  return [5, 4, 3, 2, 1].map(n => format(addMonths(currentDate, -n), 'LLL', { locale: ptBR }))
})

const yearMonthArr = computed(() => {
  const currentYearMonth = auth.currentYearMonth.value
  const currentDate = new Date(`${currentYearMonth}-01 00:00`)
  return [5, 4, 3, 2, 1].map(n => format(addMonths(currentDate, -n), 'yyy-MM', { locale: ptBR }))
})

const toggleCurrentColorOption = () => {
  currentColorOptionIndex.value = currentColorOptionIndex.value === 0 ? 1 : 0
  localStorage.setItem('currentColorOptions', currentColorOptionIndex.value.toString())
}

const setCountFilter = (value: number) => {
  countFilter.value = value
}

const getColor = (yearMonth: string, monthlyObj: Record<string, number>, createDate: string) => {
  if (monthlyObj[yearMonth] && monthlyObj[yearMonth] > 0) {
    return 'green'
  } else if (new Date(`${yearMonth}`) < new Date(createDate)) {
    return 'black'
  }
  return 'red'
}

const getColorCurrentAmount = (linearity: LinearityPerCustomerItem): string => {
  const currentYearMonth = useAuth().currentYearMonth
  const closeDay = useAuth().user.value?.dtFechamento
  const monthRatio = DateUtils.monthRatio(undefined, undefined, currentYearMonth.value, closeDay)
  const _monthRatio = currentColorOptionIndex.value === 1
    ? monthRatio
    : 1
  const average = ((linearity.total_amount - linearity.current_amount) / linearity.count) * _monthRatio
  const current = linearity.current_amount
  const ratio = current / average

  if (ratio >= 1.2) {
    return 'bg-blue-2'
  }

  if (ratio >= 0.8) {
    return 'bg-green-2'
  }

  if (ratio >= 0.5) {
    return 'bg-orange-2'
  }

  return 'bg-red-3'
}

export function useLinearity () {
  return {
    sortDescending,
    sortByColumn,
    sortType: computed(() => sortDescending.value ? 'DESC' : 'ASC'),
    currentColorOptions: computed(() => currentColorOptions.value),
    currentColorOptionIndex: computed(() => currentColorOptionIndex.value),
    toggleCurrentColorOption,
    getColor,
    getColorCurrentAmount,
    labels,
    monthLabels,
    yearMonthArr,
    countFilter: computed(() => countFilter.value),
    setCountFilter,
    mobileCurrentTab
  }
}
