import { apiProvider } from 'src/boot/axios'
import { DateUtils } from 'src/utils/date.utils'
import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { SalesStateInterface } from './sales.state'
import { TeamTree, Order, OrderProduct } from './sales.types'

const actions: ActionTree<SalesStateInterface, StateInterface> = {
  async getEquipeTree ({ commit }) {
    try {
      commit('setError', { key: 'getEquipeTree', value: false })
      commit('setLoading', { key: 'getEquipeTree', value: true })
      // await new Promise(resolve => setTimeout(resolve, 2000))
      const data = (await apiProvider.axios.get<TeamTree>('bi/sales/equipe/tree')).data
      commit('setEquipeTree', data)
    } catch (err: any) {
      const message = `Erro ${err?.response?.status ?? 'interno'}`
      commit('setError', { key: 'getEquipeTree', value: message })
    } finally {
      commit('setLoading', { key: 'getEquipeTree', value: false })
    }
  },

  async getTeams ({ commit }) {
    try {
      commit('setError', { key: 'getTeams', value: false })
      commit('setLoading', { key: 'getTeams', value: true })
      const data = (await apiProvider.axios.get('bi/sales/equipe/own-teams')).data
      commit('setTeams', data)
    } catch (err: any) {
      const message = err?.response?.message ?? 'Erro'
      commit('setError', { key: 'getTeams', value: message })
    } finally {
      commit('setLoading', { key: 'getTeams', value: false })
    }
  },

  async getSellers ({ commit }) {
    try {
      commit('setError', { key: 'getSellers', value: false })
      commit('setLoading', { key: 'getSellers', value: true })
      const { entities: data } = (await apiProvider.axios.get('bi/sales/equipe/own-sellers')).data
      commit('setSellers', data)
    } catch (err: any) {
      const message = err?.response?.message ?? 'Erro'
      commit('setError', { key: 'getSellers', value: message })
    } finally {
      commit('setLoading', { key: 'getSellers', value: false })
    }
  },

  async getOrdersFromSellers (store, params) {
    const { data: response } = await apiProvider.axios.get<Order[]>('/bi/sales/pedidos-vendedor', {
      params
    })
    return response.map(item => ({
      ...item,
      dtEntrega: new Date(DateUtils.dateToLocalDate(item.dtEntrega) as number),
      dtEmissao: new Date(DateUtils.dateToLocalDate(item.dtEmissao) as number)
    }))
  },

  async getOrderProducts (store, cdOrder) {
    const { data: response } = await apiProvider.axios.get<OrderProduct[]>('/bi/sales/pedido-produtos', {
      params: {
        cdOrder
      }
    })
    return response
  }
}

export default actions
