/* eslint-disable no-unused-vars */
import { apiProvider } from 'src/boot/axios'
import { Ref, ref, computed } from 'vue'

export interface FavoriteProductDTO {
  code: number,
  label: string
}

type IterationModeTypes = 'previous' | 'previous_years' | 'yearly'
type DataModeTypes = 'revenue' | 'markup' | 'profit' | 'products_count'
type FrequencyTypes = 'monthly' | 'quartely' | 'semester' | 'anualy'
const labelsMap: { dataMode: Record<DataModeTypes, string>, frequency: Record<FrequencyTypes, string>, iterationMode: Record<IterationModeTypes, string> } = {
  dataMode: {
    revenue: 'Fat.',
    markup: 'Markup',
    profit: 'Lucro',
    products_count: 'Qtd de Prod.'
  },
  frequency: {
    anualy: 'Anual',
    monthly: 'Mensal',
    quartely: 'Trim.',
    semester: 'Semes.'
  },
  iterationMode: {
    previous: 'Anteriores',
    previous_years: 'Anos Anteriores',
    yearly: 'Anual'
  }
}

const selectedFavoriteProduct: Ref<FavoriteProductDTO | null> = ref(null)
const favoriteProducts: Ref<FavoriteProductDTO[]> = ref([])
const favoriteProductsLoading: Ref<boolean> = ref(false)

const removeFavoriteProductSelected = () => {
  selectedFavoriteProduct.value = null
}

const setFavoriteProduct = (favoriteProduct: FavoriteProductDTO) => {
  if (favoriteProduct.code === selectedFavoriteProduct.value?.code) {
    removeFavoriteProductSelected()
  } else {
    selectedFavoriteProduct.value = favoriteProduct
  }
}

const getFavoriteProducts = async (force = false) => {
  if (force || favoriteProducts.value.length === 0) {
    favoriteProductsLoading.value = true
    await apiProvider.axios.get<FavoriteProductDTO[]>('bi/sales/favorite-products')
      .then(response => { favoriteProducts.value = response.data })
      .finally(() => { favoriteProductsLoading.value = false })
  }
}

const iterationModeOptions = ref([
  { label: 'Períodos anteriores', value: 'previous' },
  { label: 'Anos anteriores', value: 'previous_years' },
  { label: 'Anual', value: 'yearly' }
])

const dataModeOptions = ref([
  { label: 'Fat.', value: 'revenue' },
  { label: 'Markup', value: 'markup' },
  { label: 'Lucro', value: 'profit' },
  { label: 'Qtd. Prod.', value: 'products_count' }
]) as Ref<Array<{label: string, value: DataModeTypes}>>

const frequencyOptions = ref([
  { label: 'Mensal', value: 'monthly' },
  { label: 'Trim.', value: 'quartely' },
  { label: 'Semes.', value: 'semester' },
  { label: 'Anual', value: 'anualy' }
]) as Ref<Array<{ label: string, value: FrequencyTypes }>>

const iterationOptions: Ref<Array<{ label: string, value: number }>> = ref([
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 }
])

const headerModels = ref({
  dataMode: 'revenue',
  iterationMode: 'previous',
  frequency: 'monthly',
  iterations: 6
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
    headerModels,
    setFavoriteProduct,
    getFavoriteProducts,
    selectedFavoriteProduct: computed(() => selectedFavoriteProduct.value),
    favoriteProductsLoading: computed(() => favoriteProductsLoading.value),
    favoriteProducts: computed(() => favoriteProducts.value),
    removeFavoriteProductSelected
  }
}
