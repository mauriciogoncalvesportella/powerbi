import { MutationTree } from 'vuex'
import { RevenueStateInterface } from './revenue.state'

const mutation: MutationTree<RevenueStateInterface> = {
  setYearMonth (state, payload: string) {
    state.yearMonth = payload
  }
}

export default mutation
