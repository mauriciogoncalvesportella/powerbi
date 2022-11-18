/* eslint-disable */
import { RouteRecordRaw } from 'vue-router'
import Middleware from './middlewares'

const routes: RouteRecordRaw[] = [
  {
    name: 'login',
    path: '/login',
    beforeEnter: Middleware.alreadyAuthenticated,
    component: () => import('pages/Login.vue')
  },
  {
    path: '',
    redirect: 'dashboard'
  },
  {
    name: 'dashboard',
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: Middleware.auth,
    redirect: { name: 'dashboard-faturamento' },
    children: [
      {
        name: 'dashboard-faturamento',
        path: '/dashboard/faturamento',
        beforeEnter: Middleware.cjmUser9999OnlyLinearity,
        component: () => import('pages/Revenue/RevenuePage.vue')
      },
      {
        name: 'dashboard-markup',
        path: '/dashboard/markup',
        beforeEnter: [Middleware.cjmDisableSellerMarkup, Middleware.cjmUser9999OnlyLinearity],
        component: () => import('pages/Markup/MarkupPage.vue')
      },
      {
        name: 'dashboard-profit',
        path: '/dashboard/lucro',
        beforeEnter: [Middleware.directionOnly, Middleware.cjmUser9999OnlyLinearity],
        component: () => import('pages/Profit/ProfitPage.vue')
      },
      {
        name: 'dashboard-comparative',
        path: '/dashboard/comparativo',
        beforeEnter: Middleware.cjmUser9999OnlyLinearity,
        component: () => import('pages/Comparative/ComparativePage.vue')
      },
      {
        name: 'dashboard-linearity',
        path: '/dashboard/linearidade',
        component: () => import('pages/Linearity/LinearityPage.vue')
      },
      {
        name: 'dashboard-factory',
        path: '/dashboard/factory',
        beforeEnter: Middleware.cjmUser9999OnlyLinearity,
        component: () => import('pages/Factory/FactoryPage.vue'),
        props: { menu: 'factory' }
      },
      {
        name: 'dashboard-category',
        path: '/dashboard/category',
        beforeEnter: Middleware.cjmUser9999OnlyLinearity,
        component: () => import('pages/Factory/FactoryPage.vue'),
        props: { menu: 'category' }
      },
      {
        name: 'dashboard-users',
        path: '/dashboard/users',
        beforeEnter: Middleware.cjmUser9999OnlyLinearity,
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
