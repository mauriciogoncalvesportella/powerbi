import { GetterTree } from 'vuex'
import { StateInterface } from '../index'
import { SalesStateInterface } from './sales.state'
import { Team } from './sales.types'

const getters: GetterTree<SalesStateInterface, StateInterface> = {
  teamArr (state) {
    const ret: Array<Team> = []
    for (const team of state.teamTree) {
      ret.push(...team)
    }
    return ret
    // your code
  }
}

export default getters
