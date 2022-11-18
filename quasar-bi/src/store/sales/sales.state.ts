import { format } from 'date-fns'
import { Team, TeamTree, Seller } from './sales.types'

export class SalesStateInterface {
  teamTree: TeamTree = []
  teamsMap: Map<number, Team> = new Map()
  sellersMap: Map<number, Seller> = new Map()
  sellersByTeam: Map<number, Seller[]> = new Map()
  isLeafTeam: Map<number, boolean> = new Map()
  teams: Team[] = []
  sellers: Seller[] = []
  loading: { [id: string]: boolean } = {}
  loaded: { [id: string]: boolean } = {}
  error: { [id: string]: string | undefined } = {}
  yearMonth: string = format(new Date(), 'yyyy-MM')
}

function state (): SalesStateInterface {
  return {
    isLeafTeam: new Map(),
    teamsMap: new Map(),
    sellersMap: new Map(),
    sellersByTeam: new Map(),
    sellers: [],
    teamTree: [],
    teams: [],
    yearMonth: format(new Date(), 'yyyy-MM'),
    loading: {
      getEquipeTree: false,
      getTeams: false,
      getSellers: false
    },
    loaded: {
      getEquipeTree: false,
      getTeams: false,
      getSellers: false
    },
    error: {
      getEquipeTree: undefined,
      getTeams: undefined,
      getSellers: undefined
    }
  }
}

export default state
