<template>
  <div
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
    <div
      v-else
    >
      <q-tree
        :nodes="nodes"
        node-key="key"
        tick-strategy="leaf"
        v-model:ticked="ticked"
        class="q-ma-sm"
        :default-expand-all="nodes.length === 1"
        @update:ticked="updateTicked"
      >
        <template
          v-slot:default-header={node}
        >
          <span
            class="text-subtitle2 ellipsis"
            style="max-width: 150px"
          >
            <q-icon
              v-if="node.icon"
              :name="node.icon"
              size="xs"
            />
            {{ node.label }}
          </span>
          <q-space />
          <q-chip
            v-if="node.value"
            size="sm"
          >
            {{ number2thousand(node.value) }}
          </q-chip>
        </template>
      </q-tree>
      <q-btn
        color="primary"
        label="Filtrar"
        class="full-width"
        flat
        @click="clickButtonHandle"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-class-component'
import { RevenueTeam } from 'src/store/sales/revenue/revenue.types'
import { Seller, Team } from 'src/store/sales/sales.types'

interface Option {
  label: string;
  value: number;
}

class Props {
  cds!: number[];
  yearMonthArray!: string[];
}

interface NodeTree {
  key: string, // team_0, seller_0
  label: string,
  value: number,
  icon?: string,
  children?: NodeTree[]
}

export default class TeamListApi extends Vue.with(Props) {
  loading = false
  nodes: NodeTree[] = []
  options: Option[] = []
  ticked: string[] = []
  lastKey?: 'seller' | 'team'

  get teams (): Team[] {
    return this.$store.state.sales.teams
  }

  get teamsMap (): Map<number, Team> {
    return this.$store.state.sales.teamsMap
  }

  get sellersMap (): Map<number, Seller> {
    return this.$store.state.sales.sellersMap
  }

  updateTicked () {
    const key: string = this.ticked.slice(-1)[0]
    if (key) {
      this.lastKey = key.startsWith('seller') ? 'seller' : 'team'
      // @ts-ignore
      this.ticked = this.ticked.filter(item => item.startsWith(this.lastKey))
    }
  }

  clickButtonHandle () {
    if (this.lastKey && this.ticked.length > 0) {
      const cds = this.ticked.map(item => parseInt(item.split('_')[1]))
      if (this.lastKey === 'seller') {
        this.$emit('filter-by-sellers', cds)
      } else if (this.lastKey === 'team') {
        this.$emit('filter-by-teams', cds)
      }
    }
  }

  mounted () {
    this.fetch()
  }

  async fetch () {
    this.loading = true
    const data: RevenueTeam[] = (await this.$store.dispatch('sales/faturamento/team', {
      cds: this.cds,
      yearMonthArray: this.yearMonthArray
    }))

    for (const item of data) {
      const nmEquipe = this.teamsMap.get(item.teamCode)?.nmEquipe ?? 'Erro'
      const parentNode: NodeTree = {
        key: nmEquipe,
        value: item.value,
        label: nmEquipe,
        children: [
          ...item.sellers.map(seller => ({
            key: `seller_${seller.sellerCode}`,
            value: seller.value,
            icon: 'person',
            label: this.sellersMap.get(seller.sellerCode)?.nmVendedor ?? 'Erro'
          })),
          ...item.childTeams.map(team => ({
            key: `team_${team.teamCode}`,
            value: team.value,
            icon: 'groups',
            label: this.teamsMap.get(team.teamCode)?.nmEquipe ?? 'Erro'
          }))
        ]
      }

      // @ts-ignore
      if (parentNode?.children[0]?.children?.length === 0) {
        parentNode.children?.splice(0, 1)
      }
      // @ts-ignore
      if (parentNode?.children[1]?.children?.length === 0) {
        parentNode.children?.splice(1, 1)
      }
      this.nodes.push(parentNode)
    }
    this.loading = false
  }
}
</script>
