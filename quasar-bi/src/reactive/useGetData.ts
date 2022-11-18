import { ref, computed, Ref } from 'vue'

export function useGetData (getDataFunction: () => Promise<any>, checkNoData?: (data: any) => boolean) {
  const loading = ref(false)
  const noData = ref(false)
  const error = ref(false)
  const data: Ref<any> = ref(undefined)

  const getData = async () => {
    try {
      noData.value = false
      error.value = false
      loading.value = true
      data.value = await getDataFunction()

      if (checkNoData !== undefined) {
        noData.value = checkNoData(data.value)
      } else {
        if (Array.isArray(data.value) && data.value.length === 0) {
          noData.value = false
        } else {
          const key = Object.keys(data.value)[0]
          noData.value = data.value[key]?.length <= 0
        }
      }
    } catch (e) {
      console.error(e)
      error.value = true
    } finally {
      loading.value = false
    }
  }

  return {
    getData,
    loading: computed(() => loading.value),
    noData: computed(() => noData.value),
    error: computed(() => error.value),
    data: computed(() => data.value)
  }
}
