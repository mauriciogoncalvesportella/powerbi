/* eslint-disable no-unused-vars */
import { Ref, ref, computed } from 'vue'

type IterationModeTypes = 'previous' | 'periods'
type DataModeTypes = 'revenue' | 'markup' | 'profit'
type FrequencyTypes = 'monthly' | 'quartely' | 'semester' | 'anualy'
const labelsMap: { dataMode: Record<DataModeTypes, string>, frequency: Record<FrequencyTypes, string>, iterationMode: Record<IterationModeTypes, string> } = {
  dataMode: {
    revenue: 'Faturamento',
    markup: 'Markup',
    profit: 'Lucro'
  },
  frequency: {
    anualy: 'Anual',
    monthly: 'Mensal',
    quartely: 'Trim.',
    semester: 'Semes.'
  },
  iterationMode: {
    previous: 'Anteriores',
    periods: 'períodos'
  }
}

const iterationModeOptions = ref([
  { label: 'Anteriores', value: 'previous' },
  { label: 'Períodos', value: 'periods' }
])

const dataModeOptions = ref([
  { label: 'Faturamento', value: 'revenue' },
  { label: 'Markup', value: 'markup' },
  { label: 'Lucro', value: 'profit' }
]) as Ref<Array<{label: string, value: DataModeTypes}>>

const frequencyOptions = ref([
  { label: 'Mensal', value: 'monthly' },
  { label: 'Trim.', value: 'quartely' },
  { label: 'Semes.', value: 'semester' },
  { label: 'Anual', value: 'anualy' }
]) as Ref<Array<{ label: string, value: FrequencyTypes }>>

const iterationOptions: Ref<Array<{ label: string, value: number }>> = ref([
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 }
])

const headerModels = ref({
  dataMode: 'revenue',
  iterationMode: 'previous',
  frequency: 'monthly',
  iterations: 3
}) as Ref<{ dataMode: DataModeTypes, frequency: FrequencyTypes, iterationMode: IterationModeTypes, iterations: number }>

const labels = computed(() => ({
  dataMode: labelsMap.dataMode[headerModels.value.dataMode],
  frequency: labelsMap.frequency[headerModels.value.frequency],
  iterationMode: labelsMap.iterationMode[headerModels.value.iterationMode],
  iterations: headerModels.value.iterations
}))

export function useComparative () {
  return {
    labels,
    dataModeOptions,
    frequencyOptions,
    iterationOptions,
    iterationModeOptions,
    headerModels
  }
}
