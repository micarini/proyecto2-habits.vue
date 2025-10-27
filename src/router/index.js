import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'

const Onboarding = () => import('../views/Onboarding.vue')
const Goals = () => import('../views/Goals.vue')
const Home = () => import('../views/Home.vue')

const routes = [
  { path: '/', name: 'Landing', component: Landing },
  { path: '/onboarding', name: 'Onboarding', component: Onboarding },
  { path: '/goals', name: 'Goals', component: Goals },
  { path: '/home', name: 'Home', component: Home },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
