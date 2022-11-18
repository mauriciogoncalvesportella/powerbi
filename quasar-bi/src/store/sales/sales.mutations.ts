import { MutationTree } from 'vuex'
import { MutationSetError, MutationSetLoading } from '../types'
import { SalesStateInterface } from './sales.state'
import { Team, TeamTree, Seller } from './sales.types'

const mutation: MutationTree<SalesStateInterface> = {
  setYearMonth (state, payload: string) {
    state.yearMonth = payload
  },

  setLoading (state, { key, value }: MutationSetLoading) {
    state.loading[key] = value
  },

  setEquipeTree (state, teamTree: TeamTree) {
    state.teamTree = teamTree
    state.loaded.getEquipeTree = true
  },

  setTeams (state, teams: Team[]) {
    const teamsMap: Map<number, Team> = new Map()
    teams.forEach(team => state.isLeafTeam.set(team.cd, true))
    teams.forEach(team => {
      teamsMap.set(team.cd, team)
      state.isLeafTeam.set(team.cdEquipePai ?? -1, false)
    })

    state.teams = teams
    state.teamsMap = teamsMap
  },

  setSellers (state, sellers: Seller[]) {
    const sellersMap: Map<number, Seller> = new Map()
    const sellersByTeam: { [cd: number]: Seller[] } = {}
    for (const seller of sellers) {
      sellersMap.set(seller.cd, seller)
      sellersByTeam[seller.cdEquipe] = sellersByTeam[seller.cdEquipe] ?? []
      sellersByTeam[seller.cdEquipe].push(seller)
    }

    for (const key in sellersByTeam) {
      state.sellersByTeam.set(parseInt(key), sellersByTeam[key])
    }

    state.sellers = sellers
    state.sellersMap = sellersMap
  },

  setError (state, { key, value }: MutationSetError) {
    state.error[key] = value
  }
}

export default mutation
