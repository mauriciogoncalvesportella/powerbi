<template>
  <div
    class="column"
    style="min-width: 340px"
  >
    <q-card
      v-if="loading"
      style="height: 100px"
    >
      <q-inner-loading
        showing
      >
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
    <template
      v-else
    >
      <q-item
        v-for="item in options"
        :key="item.sellerCode"
        tag="label"
        v-ripple
        dense
      >
        <q-item-section
          avatar
        >
          <q-checkbox
            v-model="ticked"
            :val="item.sellerCode"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label
            class="text-subtitle2 ellipsis"
            style="max-width: 150px"
          >
            {{ item.sellerName }}
          </q-item-label>
        </q-item-section>
        <q-space />
        <q-chip
          size="sm"
        >
          {{ number2thousand(item.value) }}
        </q-chip>
      </q-item>
      <q-btn
        color="primary"
        label="Filtrar"
        class="full-width"
        flat
        @click="clickButtonHandle"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { RevenueSeller } from 'src/store/sales/revenue/revenue.types'
import { Seller } from 'src/store/sales/sales.types'
import { Vue } from 'vue-class-component'

interface Options extends RevenueSeller {
  model: boolean
}

class Props {
  cds!: number[];
  yearMonthArray!: string[];
}

export default class TeamList extends Vue.with(Props) {
  options: Options[] = []
  ticked: number[] = []
  loading: boolean = false

  get sellersMap (): Map<number, Seller> {
    return this.$store.state.sales.sellersMap
  }

  clickButtonHandle () {
    if (this.ticked.length > 0) {
      this.$emit('filter', this.ticked)
    }
  }

  mounted () {
    this.fetch()
  }

  async fetch () {
    this.loading = true

    this.options = (await this.$store.dispatch('sales/faturamento/sellers', {
      cds: this.cds,
      yearMonthArray: this.yearMonthArray
    }) as RevenueSeller[]).map(revenue => ({
      ...revenue,
      model: false
    }))

    this.loading = false
  }
}
</script>
