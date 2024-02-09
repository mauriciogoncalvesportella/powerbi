/* eslint-disable */
import { RouteRecordRaw } from 'vue-router'
import Middleware from './middlewares'
import MigrationMiddleware from './migration.middleware'
import UserRolesMiddleware from './user-roles.middleware.'
import Routes from 'src/utils/routes'

const routes: RouteRecordRaw[] = [
  {
    name: Routes.LOGIN,
    path: '/login',
    beforeEnter: [Middleware.alreadyAuthenticated, MigrationMiddleware],
    component: () => import('pages/Login.vue')
  },
  {
    path: '',
    redirect: 'dashboard'
  },
  {
    name: Routes.DASHBOARD,
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: [Middleware.auth, MigrationMiddleware],
    redirect: { name: Routes.DASHBOARD_REVENUE },
    children: [
      {
        name: Routes.DASHBOARD_REVENUE,
        path: '/dashboard/faturamento',
        beforeEnter: Middleware.cjmUser9999OnlyLinearity,
        component: () => import('pages/Revenue/RevenuePage.vue')
      },
      {
        name: Routes.DASHBOARD_MARKUP,
        path: '/dashboard/markup',
        beforeEnter: [Middleware.cjmDisableSellerMarkup, Middleware.cjmUser9999OnlyLinearity],
        component: () => import('pages/Markup/MarkupPage.vue')
      },
      {
        name: Routes.DASHBOARD_PROFIT,
        path: '/dashboard/lucro',
        beforeEnter: [Middleware.directionOnly, Middleware.cjmUser9999OnlyLinearity],
        component: () => import('pages/Profit/ProfitPage.vue')
      },
      {
        name: Routes.DASHBOARD_COMPARATIVE,
        path: '/dashboard/comparativo',
        beforeEnter: Middleware.cjmUser9999OnlyLinearity,
        component: () => import('pages/Comparative/ComparativePage.vue')
      },
      {
        name: Routes.DASHBOARD_LINEARITY,
        path: '/dashboard/linearidade',
        component: () => import('pages/Linearity/LinearityPage.vue')
      },
      {
        name: Routes.DASHBOARD_FACTORY,
        path: '/dashboard/factory',
        beforeEnter: Middleware.cjmUser9999OnlyLinearity,
        component: () => import('pages/Factory/FactoryPage.vue'),
        props: { menu: 'factory' }
      },
      {
        name: Routes.DASHBOARD_CATEGORY,
        path: '/dashboard/category',
        beforeEnter: Middleware.cjmUser9999OnlyLinearity,
        component: () => import('pages/Factory/FactoryPage.vue'),
        props: { menu: 'category' }
      },
      {
        name: Routes.DASHBOARD_MANAGEUSERS,
        path: '/dashboard/users',
        beforeEnter: UserRolesMiddleware('manage_sellers'),
        component: () => import('pages/UserStatus.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
