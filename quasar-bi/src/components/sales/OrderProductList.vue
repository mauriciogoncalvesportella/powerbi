<template>
  <div>
    <q-inner-loading
      v-if="loading"
      :showing="true"
    >
      <q-spinner-gears
        size="50px"
        color="primary"
      />
    </q-inner-loading>
    <template
      v-else
    >
      <q-virtual-scroll
        class="bg-white"
        :items="rows"
        separator
      >
        <template
          v-slot="{ item }"
        >
          <q-item
            clickable
            style="with: 500px"
            v-ripple
          >
            <q-item-section>
              <q-item-label
                lines="1"
              >
                {{ item.product.nmProduto }}
              </q-item-label>
              <q-item-label
                caption
              >
                x{{ item.qtProduto }}
              </q-item-label>
            </q-item-section>

            <q-item-section
              side
            >
              {{ number2currency(item.vlTotal) }}
            </q-item-section>
          </q-item>
        </template>
      </q-virtual-scroll>
    </template>
  </div>
</template>

<script lang="ts">
import { OrderProduct } from 'src/store/sales/sales.types'
import { Vue } from 'vue-class-component'

class Props {
  cdOrder!: number
}

export default class OrderTable extends Vue.with(Props) {
  loading = false
  rows: OrderProduct[] = []

  async fetch () {
    this.loading = true
    this.rows = await this.$store.dispatch('sales/getOrderProducts', this.cdOrder)
    this.loading = false
  }
}
</script>
