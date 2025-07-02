import { boot } from 'quasar/wrappers'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import store from 'src/store'
import { useAuth } from 'src/reactive/UseAuth'

let url: string
if (window.location.host.includes('8080')) {
  url = `http://${window.location.hostname}:3000/api`
} else {
  url = 'https://bi.datacompanysistemas.com/api'
}
/*
if (window.location.host === 'localhost:8080') {
 url = 'http://localhost:8080'
}
*/
// const url = 'https://bi.datacompanysistemas.com/api'
// const url = 'http://localhost:3000/api'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: ApiProvider;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
//
class ApiProvider {
  private instance: AxiosInstance

  constructor () {
    const jwt = localStorage.getItem('jwt')

    if (jwt) {
      this.instance = axios.create({
        baseURL: url,
        headers: {
          authorization: `Bearer ${jwt}`
        }
      })
    } else {
      this.instance = axios.create({ baseURL: url })
    }

    this.instance.interceptors.response.use(
      response => {
        return response
      },
      (err: AxiosError) => {
        if (err.response?.status === 401 && !err.request?.responseURL?.includes('/login')) {
          useAuth().logout('session_expired=true')
        }
        return Promise.reject(err)
      }
    )

    this.instance.interceptors.request.use((request: AxiosRequestConfig) => {
      request.headers['check-frontend-version'] = true
      request.headers['version-control'] = localStorage.getItem('version') ?? 'default'
      
      // Adicione o cabeçalho x-tenant-id a todas as requisições
      const tenantId = localStorage.getItem('tenantId') || 'default_tenant';
      request.headers['x-tenant-id'] = tenantId;
      
      return request
    })

    this.instance.interceptors.response.use((response) => {
      const currentVersion = localStorage.getItem('version')
      const serverVersion = response.headers['version-control']
      if (currentVersion !== serverVersion) {
        store.commit('updateVersion', serverVersion)
      }
      return response
    })
  }

  get axios () {
    return this.instance
  }

  public setAuthorization (jwt: string) {
    this.instance = axios.create({
      baseURL: url,
      headers: {
        authorization: `Bearer ${jwt}`
      }
    })
    
    // Reaplique os interceptors após recriar a instância
    this.applyInterceptors();
  }
  
  // Método para garantir que interceptors sejam aplicados ao recriar instância
  private applyInterceptors() {
    // Response interceptor para tratamento de erros
    this.instance.interceptors.response.use(
      response => {
        return response
      },
      (err: AxiosError) => {
        if (err.response?.status === 401 && !err.request?.responseURL?.includes('/login')) {
          useAuth().logout('session_expired=true')
        }
        return Promise.reject(err)
      }
    )

    // Request interceptor para headers comuns
    this.instance.interceptors.request.use((request: AxiosRequestConfig) => {
      request.headers['check-frontend-version'] = true
      request.headers['version-control'] = localStorage.getItem('version') ?? 'default'
      
      // Adicione o cabeçalho x-tenant-id a todas as requisições
      const tenantId = localStorage.getItem('tenantId') || 'default_tenant';
      request.headers['x-tenant-id'] = tenantId;
      
      return request
    })

    // Response interceptor para versão
    this.instance.interceptors.response.use((response) => {
      const currentVersion = localStorage.getItem('version')
      const serverVersion = response.headers['version-control']
      if (currentVersion !== serverVersion) {
        store.commit('updateVersion', serverVersion)
      }
      return response
    })
  }
}

const apiProvider = new ApiProvider()

export default boot(({ app }) => {

  app.config.globalProperties.$api = apiProvider
})

export { apiProvider }