<template>
  <div
    v-if="!error"
  >
    <linearity-table
      v-if="$q.screen.gt.sm"
      :data="data"
      :loading="loading"
      :loadedAll="loadedAll"
      @on-load="onLoad"
      @open-customer-dialog="openCustomerDialog"
      @open-order-dialog="openOrderDialog"
    />
    <!-- <linearity-list
      :data="data"
      :loading="loading"
      :loadedAll="loadedAll"
      @on-load="onLoad"
      @open-customer-dialog="openCustomerDialog"
      @open-order-dialog="openOrderDialog"
    /> -->
    <linearity-virtual-list
      v-else
      :data="data"
      @on-load="onLoad"
      @open-customer-dialog="openCustomerDialog"
      @open-order-dialog="openOrderDialog"
    />
    <customer-dialog
      ref="refCustomerDialog"
    />
    <order-info-dialog
      ref="refOrderInfoDialog"
      strategy="from-customer"
    />
  </div>
</template>

<script lang="ts">
import LinearityTable from './LinearityTable.vue'
import LinearityList from './LinearityList.vue'
import LinearityVirtualList from './LinearityVirtualList.vue'
import CustomerDialog from 'src/components/sales/CustomerDialog.vue'
import OrderInfoDialog from '../OrderInfoDialog.vue'
import { GetOrderListFromCustomer, GlobalOrderInfoDialog } from 'src/reactive/UseGlobalDialogs'
import { useLinearity } from 'src/reactive/UseLinearity'
import { computed, defineComponent, onMounted, ref, Ref, watch } from 'vue'
import { format, addMonths } from 'date-fns'
import { LinearityPerCustomerDTO } from 'src/dtos/sales/linearity.dto'
import { apiProvider } from 'src/boot/axios'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'
import UserRoles from 'src/utils/userRoles.utils'

export default defineComponent({
  props: {
    forceLoading: {
      type: Boolean,
      default: false
    }
  },

  components: { LinearityTable, LinearityList, CustomerDialog, OrderInfoDialog, LinearityVirtualList },

  setup (props) {
    const refCustomerDialog = ref(null) as Ref<any>
    const refOrderInfoDialog = ref(null) as Ref<any>
    const { countFilter, sortByColumn, sortType, currentColorOptionIndex } = useLinearity()
    const { team: teamHeader } = useTeamDropdown()
    const currentYearMonth = useAuth().currentYearMonth
    const currentDate = new Date(`${currentYearMonth.value}-01 00:00`)
    const endYearMonth = format(addMonths(currentDate, 0), 'yyyy-MM')
    const startYearMonth = format(addMonths(currentDate, -5), 'yyyy-MM')
    const loadedAll = ref(false)
    const data: Ref<LinearityPerCustomerDTO> = ref({ data: [], total: 0 })
    const error = ref(false)
    const noData = ref(false)
    const loading = ref(true)

    let offset = 0

    const getData = async (): Promise<LinearityPerCustomerDTO> => {
      const response = await apiProvider.axios.get<LinearityPerCustomerDTO>('bi/sales/linearity/per-customer', {
        params: {
          cd: teamHeader.value?.code,
          type: teamHeader.value?.type,
          start: startYearMonth,
          end: endYearMonth,
          'count-filter': countFilter.value,
          'sort-column': sortByColumn.value ?? 'total_amount',
          'sort-type': sortType.value,
          limit: 100,
          offset
        }
      })
      return response.data
    }

    const loadData = async (clear: boolean = false) => {
      error.value = false
      noData.value = false

      if (clear) {
        offset = 0
        loadedAll.value = false
        data.value = { total: 0, data: [] }
      }

      if (!loadedAll.value) {
        try {
          loading.value = true
          const values = await getData()
          offset += values.data.length
          if (values.data.length < 100) {
            loadedAll.value = true
          }
          data.value.data.push(...values.data)
        } catch (err: any) {
          error.value = true
        } finally {
          loading.value = false
        }
      } else {
        loading.value = false
      }
    }

    const openCustomerDialog = (code: number) => {
      refCustomerDialog.value?.open(code)
    }

    const openOrderDialog = ({ customerCode, start, end }: any) => {
      const _start = start ?? startYearMonth
      let _end = end ?? endYearMonth
      if (start && !end) {
        _end = _start
      }

      GlobalOrderInfoDialog.open(new GetOrderListFromCustomer(customerCode, _start, _end))
    }

    const onLoad = async (params: { done: any, clear: boolean }) => {
      if (teamHeader.value?.code) {
        await loadData(params.clear)
        if (typeof params.done === 'function') {
          params.done(data.value)
        }
      }
    }

    // watch(sortByColumn, () => loadData(true))
    // watch(sortType, () => loadData(true))
    watch(currentColorOptionIndex, () => loadData(true))
    watch(teamHeader, () => loadData(true))
    watch(countFilter, () => loadData(true))

    onMounted(() => {
      if (!UserRoles.verifyRole('linearity.all')) {
        loadData(true)
      }
    })

    return {
      openOrderDialog,
      openCustomerDialog,
      loading: computed(() => props.forceLoading || loading.value),
      data,
      onLoad,
      refCustomerDialog,
      refOrderInfoDialog,
      loadedAll,
      error
    }
  }
})
</script>
