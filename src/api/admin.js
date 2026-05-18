// src/api/admin.js
import request from '@/utils/request'

// 获取管理员大盘动态数据
export function getAdminStatsAPI() {
  return request({
    url: '/admin/stats',
    method: 'get'
  })
}

// 获取所有学生反馈列表
export function getFeedbackListAPI() {
  return request({
    url: '/admin/feedback/list',
    method: 'get'
  })
}

// 标记单条反馈为已处理
export function processFeedbackAPI(feedbackId) {
  return request({
    url: '/admin/feedback/process',
    method: 'post',
    params: { feedback_id: feedbackId } // 传递反馈 ID 给后端
  })
}