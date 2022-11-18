import { MutationTree } from 'vuex'
import { MutationSetLoading } from '../types'
import { AuthStateInterface } from './auth.state'
import { UserCredential } from './auth.types'

const mutation: MutationTree<AuthStateInterface> = {
  setUser (state, payload: UserCredential) {
    state.user = payload
    localStorage.setItem('user', JSON.stringify(payload))
  },

  setJwt (state, payload: string) {
    state.jwt = payload
    localStorage.setItem('jwt', payload)
  },

  setLoginError (state, payload: string) {
    state.loginError = payload
  },

  loading (state, { key, value }: MutationSetLoading) {
    state.loading[key] = value
  },

  logout (state) {
    localStorage.clear()
    state.jwt = undefined
    state.user = undefined
  }
}

export default mutation
