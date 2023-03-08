<template>
  <div
    v-if="!error"
    class="full-width full-height"
  >
    <linearity-table
      v-if="$q.screen.gt.sm"
      class="gt-sm"
      :data="data"
      :loading="loading"
      :loadedAll="loadedAll"
      @on-load="onLoad"
      @open-customer-dialog="openCustomerDialog"
      @open-order-dialog="openOrderDialog"
    />
    <linearity-list
      v-else
      :data="data"
      :loading="loading"
      :loadedAll="loadedAll"
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
import { useLinearity } from 'src/reactive/UseLinearity'
import { defineComponent, ref, Ref, watch } from 'vue'
import { format, addMonths } from 'date-fns'
import { LinearityPerCustomerDTO } from 'src/dtos/sales/linearity.dto'
import { apiProvider } from 'src/boot/axios'
import { useTeamDropdown } from 'src/reactive/UseTeamDropdown'
import { useAuth } from 'src/reactive/UseAuth'
import LinearityTable from './LinearityTable.vue'
import LinearityList from './LinearityList.vue'
import CustomerDialog from 'src/components/sales/CustomerDialog.vue'
import OrderInfoDialog from '../OrderInfoDialog.vue'
import { GetOrderListFromCustomer, GlobalOrderInfoDialog } from 'src/reactive/UseGlobalDialogs'

export default defineComponent({
  components: { LinearityTable, LinearityList, CustomerDialog, OrderInfoDialog },

  setup () {
    const refCustomerDialog = ref(null) as Ref<any>
    const refOrderInfoDialog = ref(null) as Ref<any>
    const { countFilter, sortColumn, sortType, currentColorOptionIndex } = useLinearity()
    const { team: teamHeader } = useTeamDropdown()
    const currentYearMonth = useAuth().currentYearMonth
    const currentDate = new Date(`${currentYearMonth.value}-01 00:00`)
    const endYearMonth = format(addMonths(currentDate, 0), 'yyyy-MM')
    const startYearMonth = format(addMonths(currentDate, -5), 'yyyy-MM')
    const loadedAll = ref(false)
    const data: Ref<LinearityPerCustomerDTO> = ref([])
    const error = ref(false)
    const noData = ref(false)
    const loading = ref(false)
    let offset = 0

    const getData = async (): Promise<LinearityPerCustomerDTO> => {
      const response = await apiProvider.axios.get<LinearityPerCustomerDTO>('bi/sales/linearity/per-customer', {
        params: {
          cd: teamHeader.value?.code,
          type: teamHeader.value?.type,
          start: startYearMonth,
          end: endYearMonth,
          'count-filter': countFilter.value,
          'sort-column': sortColumn.value,
          'sort-type': sortType.value,
          limit: 50,
          offset
        }
      })
      return response.data
    }

    const loadData = async (clear: boolean = false) => {
      if (!loading.value) {
        error.value = false
        noData.value = false

        if (clear) {
          offset = 0
          loadedAll.value = false
          data.value = []
        }

        if (!loadedAll.value) {
          try {
            loading.value = true
            const values = await getData()
            offset += values.length
            if (values.length < 50) {
              loadedAll.value = true
            }
            data.value.push(...values)
          } catch (err: any) {
            error.value = true
          } finally {
            loading.value = false
          }
        } else {
          loading.value = false
        }
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

    const onLoad = (done: any) => loadData().then(() => done())
    watch(teamHeader, () => loadData(true))
    watch(countFilter, () => loadData(true))
    watch(sortColumn, () => loadData(true))
    watch(sortType, () => loadData(true))
    watch(currentColorOptionIndex, () => loadData(true))

    return {
      openOrderDialog,
      openCustomerDialog,
      loading,
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
