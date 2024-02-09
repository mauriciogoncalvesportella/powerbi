
import UserRoles from 'src/utils/userRoles.utils'

const UserRolesMiddleware = (role: string) => {
  return (to: any, from: any, next: any) => {
    if (UserRoles.verifyRole(role)) {
      return next()
    }
    return next({ name: 'dashboard' })
  }
}

export default UserRolesMiddleware

// const currentVersion = '2023_01_16'
// let localVersion = localStorage.getItem('localVersion') ?? '1998_07_08'

// const MigrationMiddleware = (to: any, from: any, next: any) => {
//   if (localVersion !== currentVersion) {
//     localVersion = currentVersion
//     localStorage.setItem('localVersion', localVersion)
//     return Migrations[localVersion](to, from, next)
//   }
//   next()
// }

// const Migrations: Record<string, (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => void> = {
//   // Migration para o perfil de acesso
//   '2023_01_16': () => {
//     const { logout } = useAuth()
//     logout('Sessão encerrada')
//   }
// }

// export default MigrationMiddleware
