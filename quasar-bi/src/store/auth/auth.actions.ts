import axios from 'axios'
import { apiProvider } from 'src/boot/axios'
import router from 'src/router'
import { ActionTree } from 'vuex'
import { StateInterface } from '../index'
import { AuthStateInterface } from './auth.state'
import { loginDTO } from './auth.types'

const actions: ActionTree<AuthStateInterface, StateInterface> = {
  async login ({ commit }, payload) {
    try {
      commit('loading', { key: 'login', value: true })
      const response = await apiProvider.axios.post<loginDTO>('auth/login', payload)
      commit('setJwt', response.data.jwt)
      commit('setUser', response.data.credentials)
      commit('setLoginError', undefined)
      apiProvider.setAuthorization(response.data.jwt)
      await router.push({ name: 'dashboard' })
    } catch (err: any) {
      if (axios.isAxiosError(err) && [400, 401].includes(err.response?.status ?? -1)) {
        const status = err.response?.status
        commit('setLoginError', status === 401 ? 'Usuário ou senha inválido(s)' : 'E-mail e senha requerido')
      } else {
        commit('setLoginError', 'Erro de conexão com servidor')
      }
    } finally {
      commit('loading', { key: 'login', value: false })
    }
  },

  async logout ({ commit }) {
    commit('logout')
    await router.push({ name: 'login' })
  }
}

export default actions
