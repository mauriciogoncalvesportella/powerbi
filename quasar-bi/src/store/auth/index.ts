import { Module } from 'vuex'
import { StateInterface } from '../index'
import state, { AuthStateInterface } from './auth.state'
import actions from './auth.actions'
import getters from './auth.getters'
import mutations from './auth.mutations'

const authModule: Module<AuthStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state
}

export default authModule
