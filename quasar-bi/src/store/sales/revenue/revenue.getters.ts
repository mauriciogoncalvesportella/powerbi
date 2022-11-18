import { GetterTree } from 'vuex'
import { StateInterface } from '../../index'
import { RevenueStateInterface } from './revenue.state'

const getters: GetterTree<RevenueStateInterface, StateInterface> = {
  someAction (/* context */) {
    // your code
  }
}

export default getters
