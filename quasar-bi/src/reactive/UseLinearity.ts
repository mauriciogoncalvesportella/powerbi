import { addMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ref, computed, Ref } from 'vue'
import { useAuth } from './UseAuth'

const labels: Ref<string[]> = ref([
  'Novos',
  'Péssimo',
  'Ruim',
  'Regular',
  'Bom',
  'Excelente'
])

const sortColumns: Ref<string[]> = ref([
  'customer',
  'amount'
])

const sortOptions: Ref<string[]> = ref([
  'ASC',
  'DESC'
])

const currentColorOptions: Ref<string[]> = ref([
  'Valor Fixo',
  'Proporcional'
])

const auth = useAuth()

const sortIndex: Ref<number> = ref(1)
const sortOptionIndex: Ref<number> = ref(1)
const currentColorOptionIndex: Ref<number> = ref(parseInt(localStorage.getItem('currentColorOptions') ?? '0'))
const countFilter = ref(-1)

const monthLabels = computed(() => {
  const currentYearMonth = auth.currentYearMonth.value
  const currentDate = new Date(`${currentYearMonth}-01 00:00`)
  return [1, 2, 3, 4, 5].map(n => format(addMonths(currentDate, -n), 'LLL', { locale: ptBR }))
})

const yearMonthArr = computed(() => {
  const currentYearMonth = auth.currentYearMonth.value
  const currentDate = new Date(`${currentYearMonth}-01 00:00`)
  return [1, 2, 3, 4, 5].map(n => format(addMonths(currentDate, -n), 'yyy-MM', { locale: ptBR }))
})

const toggleCurrentColorOption = () => {
  currentColorOptionIndex.value = currentColorOptionIndex.value === 0 ? 1 : 0
  localStorage.setItem('currentColorOptions', currentColorOptionIndex.value.toString())
}

const setCountFilter = (value: number) => {
  countFilter.value = value
}

const toggleSortOption = () => {
  sortOptionIndex.value = sortOptionIndex.value === 0 ? 1 : 0
}

const setSort = (index: number) => {
  sortIndex.value = index
}

const getColor = (yearMonth: string, monthlyObj: Record<string, number>, createDate: string) => {
  if (monthlyObj[yearMonth]) {
    return 'green'
  } else if (new Date(`${yearMonth}`) < new Date(createDate)) {
    return 'black'
  }
  return 'red'
}

export function useLinearity () {
  return {
    sortColumn: computed(() => sortColumns.value[sortIndex.value] ?? 'amount'),
    sortType: computed(() => sortOptions.value[sortOptionIndex.value] ?? 'DESC'),
    sortIndex: computed(() => sortIndex.value),
    sortOptionIndex: computed(() => sortOptionIndex.value),
    sortColumns: computed(() => sortColumns.value),
    sortOptions: computed(() => sortOptions.value),
    currentColorOptions: computed(() => currentColorOptions.value),
    currentColorOptionIndex: computed(() => currentColorOptionIndex.value),
    toggleSortOption,
    toggleCurrentColorOption,
    setSort,
    getColor,
    labels,
    monthLabels,
    yearMonthArr,
    countFilter: computed(() => countFilter.value),
    setCountFilter
  }
}
