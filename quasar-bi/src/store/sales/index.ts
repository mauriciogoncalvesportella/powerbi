import { Module } from 'vuex'
import { StateInterface } from '../index'
import state, { SalesStateInterface } from './sales.state'
import actions from './sales.actions'
import getters from './sales.getters'
import mutations from './sales.mutations'
import revenueModule from './revenue'

const salesModule: Module<SalesStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
  modules: {
    faturamento: revenueModule
  }
}

export default salesModule
