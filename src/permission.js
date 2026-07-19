import router from './router'
import { useUserStore } from '@/stores/user'

// 无需登录即可访问的路由
const whiteList = ['/login']

router.beforeEach(async (to, from) => {
  // 在路由守卫中读取用户状态
  const userStore = useUserStore()

  // 获取当前登录 Token
  const hasToken = userStore.token

  if (hasToken) {
    // 已登录用户进入对应首页
    if (to.path === '/login') {
      return userStore.role === 'admin' ? '/admin/dashboard' : '/'
    }
    if (to.path.startsWith('/admin') && userStore.role !== 'admin') {
      return '/'
    }
    if (!to.path.startsWith('/admin') && userStore.role === 'admin') {
      return '/admin/dashboard'
    }
    // 其他页面直接放行
    return true
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      // 放行公开页面
      return true
    } else {
      // 其余页面跳转至登录页
      return '/login'
    }
  }
})
