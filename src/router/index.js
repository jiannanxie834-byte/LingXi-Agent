import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home/index.vue'
import Resource from '../views/Resource/index.vue'
import Plan from '../views/Plan/index.vue'
import Profile from '../views/Profile/index.vue'
import Login from '../views/Login/index.vue'

const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/resource',
    component: Resource
  },
  {
    path: '/plan',
    component: Plan
  },
  {
    path: '/profile',
    component: Profile
  },
  {
    path: '/login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router