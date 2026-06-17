import axios from 'axios'
import { ElMessage } from 'element-plus'

// 1. 创建 axios 实例
const service = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 120000 // AI 生成和资源规划可能需要等待大模型返回
})

// 2. 请求拦截器：发请求之前，自动在请求头里带上 Token
service.interceptors.request.use(
  config => {
    // 🌟 核心修复：去正确的柜子（sessionStorage）里拿 Token
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 3. 响应拦截器：统一剥壳与全局错误处理 (咱们刚刚打磨的终极版)
service.interceptors.response.use(
  response => {
    const res = response.data

    // 只要后端返回 200，说明业务成功，原封不动把大包裹还给组件！
    if (res.code === 200) {
      return res
    } else {
      // 后端返回了非 200 的业务报错
      ElMessage.error(res.message || '系统遇到了一点小状况')
      return Promise.reject(new Error(res.message || 'Error'))
    }
  },
  error => {
    console.error('网络请求崩溃:', error)
    ElMessage.error('网络中断，请检查后端服务是否开启')
    return Promise.reject(error)
  }
)

export default service
