<template>
  <q-table
    v-if="data.data.length > 0 || loading"
    id="linearity-q-table"
    flat
    bordered
    row-key="customer_code"
    virtual-scroll
    hide-bottom
    class="shadow-2 linearity-sticky-collumns"
    v-model:pagination="pagination"
    :rows-per-page-options="[0]"
    :virtual-scroll-item-size="48"
    :virtual-scroll-sticky-size-start="48"
    :loading="loading"
    :rows="data.data"
    :columns="collumns"
    @virtual-scroll="onLoad"
    @request="onRequest"
  >
    <template v-slot:loading>
      <q-inner-loading
        :showing="true"
        style="z-index: 100;"
      >
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </template>

    <template v-slot:header-cell-current_amount="props">
      <q-th
        :props="props"
      >
        <!-- <q-icon name="lock_open" size="1.5em" /> -->
        <q-icon
          color="white"
          size="1.5em"
          class="cursor-pointer"
          name="change_circle"
          @click="toggleCurrentColorOption()"
        >
          <q-tooltip>
            {{ currentColorOptionIndex === 1 ? 'Usar Valor Fixo' : 'Usar Proporcional' }}
          </q-tooltip>
        </q-icon>
        {{ currentColorOptionIndex === 0 ? 'Atual Fixo' : 'Atual Prop.' }}
      </q-th>
    </template>

    <template v-slot:body-cell="{ value, rowIndex, col, row }">
      <q-td
        :class="`${color(rowIndex, col.name, row.monthly, row.create_date)} text-${col.align} ${col.classes}`"
      >
        <span
          style="cursor: pointer"
          @click="onClickCell(col, row)"
        >
          {{ value }}
        </span>
      </q-td>
    </template>

    <template v-slot:body-cell-current_amount="props">
      <q-td
        class="text-right"
        :class="getColorCurrentAmount(props.row)"
      >
        {{ props.value }}
      </q-td>
    </template>
  </q-table>
  <q-card
    v-else
    square
    style="display: flex; flex-direction: column; height: 100%;"
  >
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title
        class="text-weight-light text-subtitle2"
      >
        Clientes
      </q-toolbar-title>
    </q-toolbar>
    <div style="flex-grow: 1; position: relative;">
      <div
        class="column no-data justify-center items-center full-width full-height"
      >
        <q-icon
          name="cloud_off"
          color="primary"
          size="60px"
        />
        <span
          class="text-weight-light text-subtitle1 row items-center"
        >
          Sem dados no intervalo
        </span>
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { LinearityPerCustomerDTO, LinearityPerCustomerItem } from 'src/dtos/sales/linearity.dto'
import { useLinearity } from 'src/reactive/UseLinearity'
import { useAuth } from 'src/reactive/UseAuth'
import { DateUtils } from 'src/utils/date.utils'
import { NumberUtils } from 'src/utils/number.utils'

export default defineComponent({
  props: {
    data: {
      type: Object as PropType<LinearityPerCustomerDTO>,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    },
    loadedAll: {
      type: Boolean,
      required: true
    }
  },

  emits: [
    'on-load',
    'open-customer-dialog',
    'open-order-dialog'
  ],

  setup (props, { emit }) {
    const filter = ref('')
    const pagination = ref({ sortBy: 'customer_name', descending: false, page: 1, rowsPerPage: 100, rowsNumber: 0 })
    const currentYearMonth = useAuth().currentYearMonth
    const tooltipValue = ref(-1)
    const { monthLabels, yearMonthArr, toggleCurrentColorOption, currentColorOptionIndex, sortDescending, sortByColumn, getColorCurrentAmount } = useLinearity()
    // const onLoad = (index: number, done: any) => emit('on-load', done) // loadData().then(() => done())

    const onLoad = ({ to }: any) => {
      const lastIndex = props.data.data.length - 1
      if (props.loading !== true && to === lastIndex) {
        const done = () => 0
        emit('on-load', done)
      }
    }

    const yearMonthIds = yearMonthArr.value
    const onRequest = (params: any) => {
      if (!props.loading) {
        const { sortBy, descending } = params.pagination

        // if (sortBy.startsWith('month')) {
        //   const [, index] = sortBy.split('_')
        //   sortByColumn.value = yearMonthIds[parseInt(index)]
        //   console.log(yearMonthArr.value, sortByColumn.value)
        //   pagination.value.sortBy = sortBy
        // } else {
        //   sortByColumn.value = sortBy ?? 'customer_name'
        //   pagination.value.sortBy = sortByColumn.value
        // }
        sortByColumn.value = sortBy ?? 'customer_name'
        sortDescending.value = sortBy ? descending : false
        pagination.value.descending = sortDescending.value
        pagination.value.sortBy = sortByColumn.value

        const done = (data: LinearityPerCustomerDTO) => { pagination.value.rowsNumber = data.total }
        emit('on-load', { done, clear: true })
      }
    }

    const emitOpenOrderDialog = (customerIndex: number, customerCode: number, start?: string, end?: string) => {
      if (start && !end) {
        if (!props.data.data[customerIndex].monthly[start]) {
          return
        }
      }

      emit('open-order-dialog', {
        customerCode,
        start,
        end
      })
    }

    const mids = yearMonthArr.value // Month Ids
    const mls = monthLabels.value // Month Labels

    const color = (rowIndex: number, yearMonthColumn: string, monthlyObj: Record<string, number>, createDate: string) => {
      if (!yearMonthColumn.includes('-')) {
        return (rowIndex % 2 === 0) ? 'bg-grey-3' : 'bg-white'
      }

      if (monthlyObj[yearMonthColumn] && monthlyObj[yearMonthColumn] > 0) {
        return 'bg-green-2'
      } else if (yearMonthColumn < createDate) {
        return 'bg-grey-5'
      }

      return 'bg-red-3'
    }

    const onClickCell = (col: any, row: LinearityPerCustomerItem) => {
      if (col.name === 'customer_name') {
        return emit('open-customer-dialog', row.customer_code)
      }

      if (col.name === 'total_amount' && NumberUtils.isNotZero(row.total_amount)) {
        return emit('open-order-dialog', { customerCode: row.customer_code })
      }

      if (col.name === 'current_amount' && NumberUtils.isNotZero(row.current_amount)) {
        return emit('open-order-dialog', { customerCode: row.customer_code, start: currentYearMonth.value })
      }

      if (DateUtils.isYearMonth(col.name) && NumberUtils.isNotZero(row.monthly[col.name])) {
        const yearMonth = col.name
        return emit('open-order-dialog', { customerCode: row.customer_code, start: yearMonth, end: null })
      }
    }

    const collumns = [
      {
        name: 'customer_name',
        align: 'left',
        label: 'Cliente',
        field: (row: LinearityPerCustomerItem) => row.customer_name,
        headerStyle: 'width: 100%',
        classes: 'ellipsis',
        style: 'width: 100%',
        sortable: true
      },
      {
        name: 'total_amount',
        label: 'Total',
        field: (row: LinearityPerCustomerItem) => row.total_amount,
        format: (val: number) => NumberUtils.number2currency(val, true),
        headerStyle: 'width: 100px;',
        style: 'width: 100px',
        sortable: true
      },
      {
        name: 'average_amount',
        label: 'Ticket Médio',
        field: (row: LinearityPerCustomerItem) => (row.total_amount - row.current_amount) / row.count,
        format: (val: number) => NumberUtils.number2currency(val, true),
        headerStyle: 'width: 120px',
        style: 'width: 120px',
        sortable: true
      },
      {
        name: yearMonthIds[0],
        align: 'center',
        label: mls[0],
        field: (row: LinearityPerCustomerItem) => row.monthly[mids[0]],
        format: (val: number) => NumberUtils.number2currency(val, true),
        headerStyle: 'width: 88px',
        sortable: true
      },
      {
        name: yearMonthIds[1],
        align: 'center',
        label: mls[1],
        field: (row: LinearityPerCustomerItem) => row.monthly[mids[1]],
        format: (val: number) => NumberUtils.number2currency(val, true),
        headerStyle: 'width: 88px',
        sortable: true
      },
      {
        name: yearMonthIds[2],
        align: 'center',
        label: mls[2],
        field: (row: LinearityPerCustomerItem) => row.monthly[mids[2]],
        format: (val: number) => NumberUtils.number2currency(val, true),
        headerStyle: 'width: 88px',
        sortable: true
      },
      {
        name: yearMonthIds[3],
        align: 'center',
        label: mls[3],
        field: (row: LinearityPerCustomerItem) => row.monthly[mids[3]],
        format: (val: number) => NumberUtils.number2currency(val, true),
        headerStyle: 'width: 88px',
        sortable: true
      },
      {
        name: yearMonthIds[4],
        align: 'center',
        label: mls[4],
        field: (row: LinearityPerCustomerItem) => row.monthly[mids[4]],
        format: (val: number) => NumberUtils.number2currency(val, true),
        headerStyle: 'width: 88px',
        sortable: true
      },
      {
        name: 'current_amount',
        label: 'Atual',
        field: (row: LinearityPerCustomerItem) => row.current_amount,
        format: (val: number) => NumberUtils.number2currency(val, true),
        headerStyle: 'width: 120px',
        sortable: true
      }
    ]

    return {
      filter,
      monthLabels,
      tooltipValue,
      currentYearMonth,
      currentColorOptionIndex,
      yearMonthArr,
      collumns,
      pagination,
      onRequest,
      onClickCell,
      emitOpenOrderDialog,
      toggleCurrentColorOption,
      color,
      getColorCurrentAmount,
      onLoad
    }
  }
})
</script>

<style lang="scss">
#linearity-q-table {
  /* height or max-height is important */
  height: calc(100vh - 68px);
  border-radius: 0;
  border: none;

  table {
    table-layout: fixed;
    width: 100%;
    min-width: 1100px;
  }

  thead {
    position: sticky;
    top: 0px;
    z-index: 101;
    background-color: $primary; /* Adapte a cor conforme necessário */
    color: white; /* Cor do texto no cabeçalho */
  }

  .q-table__top {
    background-color: white;
  }

  .q-table__middle {
    overflow-y: scroll;
  }

  .q-table__bottom,
  thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: $primary;
    color: white;
  }

  th:first-child,
  td:first-child {
    position: sticky;
    left: 0;
    z-index: 1;
    background-color: white;
  }
}
</style>
