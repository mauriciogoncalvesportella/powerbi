<template>
  <div>
    <q-option-group
      :options="options"
      type="checkbox"
      v-model="ticked"
      class="q-mr-md"
    />
    <q-btn
      color="primary"
      label="Filtrar"
      class="full-width"
      flat
      @click="clickButtonHandle"
    />
  </div>
</template>

<script lang="ts">
import { Seller } from 'src/store/sales/sales.types'
import { Vue } from 'vue-class-component'

interface Option {
  label: string;
  value: number;
}

class Props {
  teamCode!: number;
  cds!: number[];
}

export default class TeamList extends Vue.with(Props) {
  options: Option[] = []
  ticked: number[] = []

  get sellers (): Seller[] {
    return this.$store.state.sales.sellersByTeam.get(this.teamCode) ?? []
  }

  get sellersMap (): Map<number, Seller> {
    return this.$store.state.sales.sellersMap
  }

  clickButtonHandle () {
    if (this.ticked.length > 0) {
      this.$emit('filter', this.ticked)
    }
  }

  created () {
    if (this.teamCode !== undefined) {
      for (const seller of this.sellers) {
        this.options.push({
          label: seller.nmVendedor,
          value: seller.cd
        })
      }
    } else {
      for (const cd of this.cds) {
        const seller = this.sellersMap.get(cd)
        if (seller) {
          this.options.push({
            label: seller.nmVendedor,
            value: seller.cd
          })
        }
      }
    }
  }
}
</script>
