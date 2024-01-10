import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import QortalRequestView from '../views/QortalRequestView.vue'

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
      path: '/about',
      name: 'about',
      component: AboutView,
    }
  ]
})

export default router
