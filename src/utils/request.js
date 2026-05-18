import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 1. 创建 axios 实例
const service = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 10000 // 请求超时时间
})

// 2. 请求拦截器：发请求之前，自动在请求头里带上 Token
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      // 这里的 Authorization 格式要跟你的后端商量好
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 3. 响应拦截器：后端返回数据后，统一判断有没有报错
service.interceptors.response.use(
  response => {
    const res = response.data
    // 假设你们后端约定的成功状态码是 200 或 20000
    if (res.code !== 200) {
      ElMessage.error(res.message || '系统未知错误')

      // 如果后端返回 401（Token 过期或未登录），直接踢回登录页
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res.data // 直接返回核心数据，页面里不用再 .data.data
    }
  },
  error => {
    ElMessage.error(error.message || '网络请求失败')
    return Promise.reject(error)
  }
)

export default service