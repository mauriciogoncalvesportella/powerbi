import { useAuth } from 'src/reactive/UseAuth'
import Routes from './routes'

const { user } = useAuth()

const routeToRole = {
  [Routes.DASHBOARD_REVENUE]: 'sales.revenue',
  [Routes.DASHBOARD_MARKUP]: 'sales.markup',
  [Routes.DASHBOARD_PROFIT]: 'sales.profit',
  [Routes.DASHBOARD_COMPARATIVE]: 'sales.comparative',
  [Routes.DASHBOARD_LINEARITY]: 'sales.linearity',
  [Routes.DASHBOARD_FACTORY]: 'sales.factory',
  [Routes.DASHBOARD_CATEGORY]: 'sales.category',
  [Routes.DASHBOARD_MANAGEUSERS]: 'sales.manage_users'
}

const verifyRole = (role: string): boolean => {
  const findedRole = user.value?.userRoles.find(it => it.includes(role))
  return findedRole != null
}

const UserRoles = {
  verifyRole,
  routeToRole
}

export default UserRoles
