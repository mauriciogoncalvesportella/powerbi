<template>
  <div
    style="min-width: 250px"
  >
    <q-tree
      v-show="teamNode.children.length > 0"
      :nodes="[teamNode]"
      node-key="cd"
      label-key="nmEquipe"
      tick-strategy="leaf"
      v-model:ticked="tickedTeam"
      class="q-ma-sm"
      @update:ticked="clearTickedSeller"
    />
    <q-tree
      v-show="sellerNode.children.length > 0"
      :nodes="[sellerNode]"
      node-key="cd"
      label-key="nmVendedor"
      tick-strategy="leaf"
      v-model:ticked="tickedSeller"
      class="q-ma-sm"
      @update:ticked="clearTickedTeam"
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
import { Seller, Team } from 'src/store/sales/sales.types'
import { Vue } from 'vue-class-component'

interface Option {
  label: string;
  value: number;
}

class Props {
  cds!: number[]
}

export default class TeamList extends Vue.with(Props) {
  teamNode = {
    nmEquipe: 'Equipes',
    children: [] as Team[]
  }

  sellerNode = {
    nmVendedor: 'Vendedores',
    children: [] as Seller[]
  }

  options: Option[] = []
  tickedTeam: number[] = []
  tickedSeller: number [] = []

  get teams (): Team[] {
    return this.$store.state.sales.teams
  }

  get teamsMap (): Map<number, Team> {
    return this.$store.state.sales.teamsMap
  }

  get sellersByTeam (): Map<number, Seller[]> {
    return this.$store.state.sales.sellersByTeam
  }

  clickButtonHandle () {
    if (this.tickedTeam.length > 0) {
      this.$emit('filter-by-teams', this.tickedTeam)
    } else if (this.tickedSeller.length > 0) {
      this.$emit('filter-by-sellers', this.tickedSeller)
    }
  }

  clearTickedSeller () {
    if (this.tickedTeam.length > 0) {
      this.tickedSeller = []
    }
  }

  clearTickedTeam () {
    if (this.tickedSeller.length > 0) {
      this.tickedTeam = []
    }
  }

  created () {
    if (this.cds.length === 1) {
      for (const team of this.teams) {
        if (team.cdEquipePai && team.cdEquipePai === this.cds[0]) {
          this.teamNode.children.push(team)
        }
      }
      const sellers = this.sellersByTeam.get(this.cds[0]) ?? []
      for (const seller of sellers) {
        this.sellerNode.children.push(seller)
      }
    } else if (this.cds.length > 1) {
      for (const cd of this.cds) {
        const team = this.teamsMap.get(cd)
        if (team) {
          this.teamNode.children.push(team)
        }
      }
    }
  }
}
</script>
