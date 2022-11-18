<template>
  <q-table
    :columns="columns"
    :rows="rows"
    :loading="loading"
    virtual-scroll
    :virtual-scroll-item-size="48"
    :virtual-scroll-sticky-size-start="48"
    :pagination="{ rowsPerPage: -1 }"
    style="min-width: 400px; height: 100%"
    class="my-sticky-dynamic"
    hide-bottom
    flat
  />
</template>

<script lang="ts">
import { format } from 'date-fns'
import { Order } from 'src/store/sales/sales.types'
import { NumberUtils } from 'src/utils/number.utils'
import { Vue } from 'vue-class-component'

class Props {
  init!: string
  end!: string
  cds!: number[]
}

interface Row extends Order {
  index: number,
  nmVendedor: string,
}

export default class OrderTable extends Vue.with(Props) {
  loading = false
  columns = [
    {
      name: 'index',
      label: '#',
      field: 'index',
      align: 'left'
    },
    {
      name: 'nmVendedor',
      label: 'Vendedor',
      field: 'nmVendedor',
      align: 'left'
    },
    {
      name: 'nmEquipe',
      label: 'Equipe',
      field: 'nmEquipe',
      align: 'left'
    },
    {
      name: 'vlProdutos',
      label: 'Valor',
      field: 'vlProdutos',
      format: (val: string) => `${NumberUtils.number2currency(val)}`,
      sortable: true,
      sort: (a: number, b: number) => a - b
    },
    {
      name: 'date',
      label: 'data',
      field: 'dtEntrega',
      format: (val: string) => format(new Date(val), 'dd/MM/yyyy'),
      sortable: true,
      sort: (a: string, b: string) => new Date(a).getTime() - new Date(b).getTime()
    }
  ]

  get sellersMap () {
    return this.$store?.state.sales.sellersMap ?? new Map()
  }

  get teamsMap () {
    return this.$store?.state.sales.teamsMap ?? new Map()
  }

  getSellerName (cd: number) {
    return this.sellersMap.get(cd)?.nmVendedor ?? 'Erro'
  }

  getTeamName (cdVendedor: number) {
    const seller = this.sellersMap.get(cdVendedor)
    if (seller) {
      return this.teamsMap.get(seller.cdEquipe)?.nmEquipe ?? 'Erro'
    }

    return 'Erro'
  }

  rows: Row[] = []

  async fetch () {
    this.loading = true
    const raw: Row[] = await this.$store.dispatch('sales/getOrdersFromSellers', {
      cds: this.cds,
      init: this.init,
      end: this.end
    })
    this.rows = raw.map((item, index) => ({
      ...item,
      index: index + 1,
      nmVendedor: this.getSellerName(item.cdVendedor),
      nmEquipe: this.getTeamName(item.cdVendedor)
    }))
    this.loading = false
  }
}
</script>

<style lang="sass">
.my-sticky-dynamic
  /* height or max-height is important */
  max-height: 640px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
  thead tr:first-child th
    top: 0
</style>
