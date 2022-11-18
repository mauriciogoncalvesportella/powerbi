<template>
  <div>
    <q-inner-loading
      v-if="loading"
      :showing="true"
    >
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
    <q-virtual-scroll
      v-else
      ref="VirtualScroll"
      class="bg-white"
      :items="rows"
      separator
    >
      <template v-slot="{ item, index }">
        <q-item
          :id="`row-${index}`"
          clickable
          v-ripple
          :class="index === lastIndex ? 'bg-grey-3' : ''"
          @click="clickHandle(index)"
        >
          <q-item-section
            avatar
            top
            class="column align-center justify-center"
          >
            <span
              class="text-caption"
            >
              {{ date2format(item.dtEntrega, 'dd/MM/yyyy') }}
            </span>
          </q-item-section>

          <q-item-section>
            <q-item-label
              lines="1"
            >
              {{ item.client.nmRazao }}
            </q-item-label>
            <q-item-label
              caption
              class="row align-center"
            >
              <q-icon
                name="account_circle"
                class="q-mr-xs"
              />
              {{ item.nmVendedor }}
            </q-item-label>
            <q-item-label
              caption
              class="row align-center"
            >
              <q-icon
                name="groups"
                class="q-mr-xs"
              />
              {{ item.nmEquipe }}
            </q-item-label>
          </q-item-section>

          <q-item-section
            side
          >
            {{ number2currency(item.vlProdutos - item.vlRapel - item.vlDesconto) }}
          </q-item-section>
        </q-item>
      </template>
    </q-virtual-scroll>
  </div>
</template>

<script lang="ts">
import { Order } from 'src/store/sales/sales.types'
import { Vue } from 'vue-class-component'

class Props {
  init!: string
  end!: string
  yearMonth!: string
  cds!: number[]
}

interface Row extends Order {
  index: number,
  nmVendedor: string,
}

export default class OrderTable extends Vue.with(Props) {
  loading = false
  lastIndex: number = -1

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

  clickHandle (index: number) {
    if (this.rows[index] != null) {
      this.lastIndex = index
      this.$emit('click-item', this.rows[index])
    }
  }

  scrollToLastIndex () {
    if (this.lastIndex !== -1) {
      // @ts-ignore
      this.$refs.VirtualScroll.scrollTo(this.lastIndex, 'center')
    }
  }

  async fetch () {
    this.loading = true

    const raw: Row[] = await this.$store.dispatch('sales/getOrdersFromSellers', {
      cds: this.cds,
      init: this.init,
      end: this.end,
      yearMonth: this.yearMonth
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
