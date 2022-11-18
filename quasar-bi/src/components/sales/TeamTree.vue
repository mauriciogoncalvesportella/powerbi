<template>
  <div>
    <q-tree
      :nodes="nodes"
      node-key="cd"
      label-key="nmEquipe"
      tick-strategy="strict"
      v-model:ticked="ticked"
      class="q-ma-sm"
      default-expand-all
    />
    <q-btn
      color="primary"
      label="Filtrar"
      style="display: block"
      class="full-width"
      flat
      @click="$emit('save', ticked)"
    />
  </div>
</template>

<script lang="ts">
import { Team } from 'src/store/sales/sales.types'
import { Vue } from 'vue-class-component'

interface TeamNode extends Team {
  children: Team[],
}

class Props {
  cds!: number[];
}

export default class TeamTree extends Vue.with(Props) {
  nodes: TeamNode[] = []
  ticked: number[] = []

  get teams (): Team[] {
    return this.$store.state.sales.teams
  }

  get teamsMap (): Map<number, Team> {
    return this.$store.state.sales.teamsMap
  }

  created () {
    /*
    for (const team of this.teams) {
      const currNode: TeamNode = { ...team, children: [] }
      if (team.cdEquipePai && this.cds.includes(team.cdEquipePai)) {
        this.nodes.push(currNode)
      }
    }
    */
    const map: Map<number, TeamNode> = new Map()
    for (const team of this.teams) {
      const currNode: TeamNode = { ...team, children: [] }
      const parentNode = map.get(team.cdEquipePai ?? -1)
      map.set(currNode.cd, currNode)
      if (!parentNode) {
        this.nodes.push(currNode)
      } else {
        parentNode.children.push(currNode)
      }
    }
  }
}
</script>
