import { useAuth } from 'src/reactive/UseAuth'
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

const currentVersion = '2023_01_16'
let localVersion = localStorage.getItem('localVersion') ?? '1998_07_08'

const MigrationMiddleware = (to: any, from: any, next: any) => {
  if (localVersion !== currentVersion) {
    localVersion = currentVersion
    localStorage.setItem('localVersion', localVersion)
    return Migrations[localVersion](to, from, next)
  }
  next()
}

const Migrations: Record<string, (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => void> = {
  // Migration para o perfil de acesso
  '2023_01_16': () => {
    const { logout } = useAuth()
    logout('message=Nova versão, usuário desconectado&color=green')
  }
}

export default MigrationMiddleware
