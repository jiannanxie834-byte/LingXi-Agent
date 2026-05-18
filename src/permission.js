import router from './router'
import { useUserStore } from '@/stores/user'

// 白名单：不需要登录就能直接访问的路由地址
const whiteList = ['/login', '/']

router.beforeEach(async (to, from) => {
  //  在路由守卫函数内部实例化 Store
  const userStore = useUserStore()

  // 1. 从真实的 Pinia 状态中心获取 Token
  const hasToken = userStore.token

  if (hasToken) {
    // 已经登录了，还想去登录页？直接强制弹回首页
    if (to.path === '/login') {
      return '/'
    }
    // 其他页面直接放行
    return true
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      // 如果去的是白名单页面（比如登录页），高举绿旗放行
      return true
    } else {
      // 如果想强行访问其他私密页面，无情拦截，踢回登录页
      return '/login'
    }
  }
})