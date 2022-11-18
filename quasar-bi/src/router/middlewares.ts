/* eslint-disable */
import { useAuth } from "src/reactive/UseAuth"
const { jwt, user } = useAuth()

function directionOnly (to: any, from: any, next: any) {
  if (user.value?.fgFuncao === 3) {
    return next()
  }
  return next({ name: 'dashboard' })
}

function auth (to: any, from: any, next: any) {
  if (jwt.value && user.value) {
    return next()
  }
  return next({ name: 'login' })
}

function alreadyAuthenticated (to: any, from: any, next: any) {
  if (jwt.value && user.value) {
    return next({ name: 'dashboard' })
  }
  return next()
}

function cjmDisableSellerMarkup (to: any, from: any, next: any) {
  if (user.value?.cdEmpresaPublic === 40) {
    if (user.value?.fgFuncao !== 3) {
      return next({ name: 'dashboard' })
    }
  }

  return next()
}

function cjmUser9999OnlyLinearity (to: any, from: any, next: any) {
  if (user.value?.cdEmpresaPublic === 40) {
    if (user.value?.cdVendedor === 9999) {
      return next({ name: 'dashboard-linearity' })
    }
  }

  return next()
} 

export default {
  auth,
  alreadyAuthenticated,
  cjmDisableSellerMarkup,
  cjmUser9999OnlyLinearity,
  directionOnly
}
