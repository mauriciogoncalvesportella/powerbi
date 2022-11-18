<template>
  <q-dialog
    v-model="enabled"
    :maximized="$q.screen.lt.sm"
    style="min-width: 400px"
  >
    <q-layout
      view="hHh LpR fFf"
      class="bg-white"
      container
    >
      <q-header
        class="bg-primary"
        style="z-index: 1"
        reveal
      >
        <q-toolbar>
          <q-toolbar-title
            class="text-weight-light text-subtitle2"
          >
            {{ state === 0 ? 'Pedidos' : 'Produtos' }}
          </q-toolbar-title>

          <div
            class="q-gutter-sm"
          >
            <q-btn
              dense
              round
              icon="arrow_back"
              :flat="state <= 0"
              :disable="state <= 0"
              @click="rootState()"
            />
            <q-btn
              v-close-popup
              round
              dense
              icon="close"
            />
          </div>
        </q-toolbar>
      </q-header>
      <q-page-container>
        <q-page>
          <order-list
            v-show="state === 0"
            ref="OrderList"
            v-bind="orderListProps"
            @click-item="nextState"
          />
          <order-product-list
            v-show="state === 1"
            ref="OrderProductList"
            v-bind="orderProductListProps"
          />
        </q-page>
      </q-page-container>
    </q-layout>
  </q-dialog>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import { Order } from 'src/store/sales/sales.types'
import OrderTable from 'src/components/sales/OrderTable.vue'
import OrderList from 'src/components/sales/OrderList.vue'
import OrderProductList from 'src/components/sales/OrderProductList.vue'

@Options({
  components: {
    OrderTable,
    OrderList,
    OrderProductList
  }
})
export default class RevenueTable extends Vue {
  enabled: boolean = false
  loading: boolean = false
  maximizedToggle: boolean = false
  orders: Order[] = []
  state: number = 0

  orderListProps: { [id: string]: any } = {
    ids: [] as number[]
  }

  orderProductListProps: { [id: string]: any } = {
    cdOrder: -1 as number
  }

  open (cds: number[], idMesAno?: string, init?: string, end?: string) {
    this.state = 0
    this.orderListProps.cds = cds

    if (init) {
      this.orderListProps.init = init
      this.orderListProps.end = end ?? init
    } else {
      this.orderListProps.yearMonth = idMesAno
    }

    this.enabled = true
    this.$nextTick(() => {
      // @ts-ignore
      this.$refs.OrderList.fetch()
    })
  }

  nextState (item: any) {
    if (item.cd !== null) {
      this.state = 1
      this.orderProductListProps.cdOrder = item.cd
      this.$nextTick(() => {
        // @ts-ignore
        this.$refs.OrderProductList.fetch()
      })
    }
  }

  rootState () {
    this.state = 0
    this.$nextTick(() => {
      // @ts-ignore
      this.$refs.OrderList.scrollToLastIndex()
    })
  }
}
</script>
