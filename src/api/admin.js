// src/api/admin.js
import request from '@/utils/request'

// 大盘统计
export const getAdminStatsAPI = () => request({ url: '/admin/dashboard/stats', method: 'get' })
export const getAdminReadinessAPI = () => request({ url: '/admin/readiness', method: 'get' })

// 学生管理
export const getAllStudentsAPI = () => request({ url: '/admin/students/list', method: 'get' })

// 资源审核
export const getAllResourcesAPI = () => request({ url: '/admin/resources/all', method: 'get' })
export const approveResourceAPI = (id) => request({ url: '/admin/resources/approve', method: 'post', data: { id } })
export const rejectResourceAPI = (id) => request({ url: '/admin/resources/reject', method: 'post', data: { id } })

// 反馈管理（一键复活你的按钮事件）
export const getAllFeedbackAPI = () => request({ url: '/admin/feedback/all', method: 'get' })
export const processFeedbackAPI = (id) => request({ url: '/admin/feedback/process', method: 'post', data: { id } })
export const deleteFeedbackAPI = (id) => request({ url: '/admin/feedback/delete', method: 'post', data: { id } })

// 分类申请审核
export const getAllTypesAPI = () => request({ url: '/resource/types/all', method: 'get' })
export const approveTypeAPI = (name) => request({ url: '/admin/types/approve', method: 'post', data: { name } })
