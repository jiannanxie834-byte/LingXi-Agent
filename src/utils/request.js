import axios from 'axios'
import { ElMessage } from 'element-plus'
import { publicErrorMessage, sanitizePublicPayload } from '@/utils/publicContent'

// 1. 创建 axios 实例
const service = axios.create({
  baseURL: '/api',
  timeout: 120000 // AI 生成和资源规划可能需要等待大模型返回
})

// 2. 请求拦截器：自动附加 Token
service.interceptors.request.use(
  config => {
    // 登录信息保存在 sessionStorage
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

// 3. 响应拦截器：统一处理业务响应与网络错误
service.interceptors.response.use(
  response => {
    const res = response.data

    // 业务成功时返回经过公开字段过滤的数据
    if (res.code === 200) {
      return sanitizePublicPayload(res)
    } else {
      // 后端返回了非 200 的业务报错
      const message = publicErrorMessage(res.message)
      ElMessage.error(message)
      return Promise.reject(new Error(message))
    }
  },
  error => {
    console.error('网络请求失败')
    ElMessage.error('网络中断，请检查后端服务是否开启')
    return Promise.reject(error)
  }
)

export default service
