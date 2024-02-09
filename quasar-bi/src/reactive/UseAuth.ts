import axios from 'axios'
import { apiProvider } from 'src/boot/axios'
import { ref, Ref, computed } from 'vue'
import { format, getDate, addMonths } from 'date-fns'

export interface UserCredential {
  role: string;
  nmVendedor: string;
  cdEmpresaPublic: number;
  cdVendedor: number;
  idEmpresa: string;
  idCnpj: string;
  cdEquipe: number;
  nmEquipe: string;
  idEquipe: number;
  fgFuncao: number;
  fgResponsavel: boolean;
  dtFechamento: number;
  userRoles: string[]
}

export interface LoginDTO {
  credentials: UserCredential,
  jwt: string,
}

const jwt = ref(localStorage.getItem('jwt') ?? undefined)

// @ts-ignore
const userLocalStorage = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : undefined
const user = ref(userLocalStorage) as Ref<UserCredential | undefined>
const loading = ref(false) as Ref<boolean>
const loginError = ref(undefined) as Ref<Error | undefined>

const login = async (payload: any) => {
  try {
    loading.value = true
    const response = await apiProvider.axios.post<LoginDTO>('auth/login', payload)
    jwt.value = response.data.jwt
    user.value = response.data.credentials
    localStorage.setItem('user', JSON.stringify(user.value))
    localStorage.setItem('jwt', jwt.value)
    apiProvider.setAuthorization(response.data.jwt)
    loginError.value = undefined
  } catch (err: any) {
    console.error(err)
    const status = err.response?.status ?? -1
    if (axios.isAxiosError(err) && [400, 401].includes(status)) {
      if (status === 400) {
        loginError.value = new Error('E-mail e senha requerido')
      } else {
        loginError.value = new Error('Usuário ou senha inválidos')
      }
      return
    }
    loginError.value = new Error('Erro interno no servidor')
  } finally {
    loading.value = false
  }
}

const currentYearMonth = computed((): string | undefined => {
  if (!user.value) {
    return undefined
  }
  if (user.value?.dtFechamento > 0) {
    const dtFechamento = user.value.dtFechamento
    const currentDay = getDate(new Date())
    if (currentDay > dtFechamento) {
      return format(addMonths(new Date(), 1), 'yyyy-MM')
    }
  }
  return format(new Date(), 'yyyy-MM')
})

const resetError = () => {
  loginError.value = undefined
}

const logout = (params: string = '') => {
  localStorage.removeItem('user')
  localStorage.removeItem('jwt')
  jwt.value = undefined
  user.value = undefined
  window.location.href = `${document.baseURI}login?${params}`
}

export function useAuth () {
  return {
    jwt,
    user,
    loading,
    loginError,
    login,
    currentYearMonth,
    resetError,
    logout
  }
}
