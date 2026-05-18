import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('@/views/Login/index.vue') },
  {
    path: '/',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      { path: '', component: () => import('@/views/Home/index.vue') },
      { path: 'resource', component: () => import('@/views/Resource/index.vue') },
      { path: 'plan', component: () => import('@/views/Plan/index.vue') },
      { path: 'profile', component: () => import('@/views/Profile/index.vue') }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', component: () => import('@/views/AdminDashboard/index.vue') },
      { path: 'resource', component: () => import('@/views/ResourceManage/index.vue') },
      { path: 'user', component: () => import('@/views/UserManage/index.vue') },
      { path: 'feedback', component: () => import('@/views/FeedbackManage/index.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router