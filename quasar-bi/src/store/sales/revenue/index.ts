import { Module } from 'vuex'
import { StateInterface } from '../../index'
import state, { RevenueStateInterface } from './revenue.state'
import actions from './revenue.actions'
import getters from './revenue.getters'
import mutations from './revenue.mutations'

const revenueModule: Module<RevenueStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state
}

export default revenueModule
