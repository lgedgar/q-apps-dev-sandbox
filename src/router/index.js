import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QortalRequestView from '../views/QortalRequestView.vue'
import QDNView from '../views/QDNView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/qortalRequest/',
      name: 'qortalRequest',
      component: QortalRequestView,
    },
    {
      path: '/qortalRequest/:action',
      name: 'qortalRequestAction',
      component: QortalRequestView,
    },
    {
      path: '/QDN/',
      name: 'QDN',
      component: QDNView,
    },
    {
      path: '/experimental/',
      name: 'experimental',
      component: () => import('../views/ExperimentalView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
