// src/api/user.js
import request from '@/utils/request'

/**
 *  用户登录接口
 * @param {Object} data - { username, password }
 * @returns Promise
 */
export function loginAPI(data) {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

/**
 *  用户注册接口
 * @param {Object} data - { username, password }
 * @returns Promise
 */
export function registerAPI(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

/**
 * 学生提交问题反馈接口
 * @param {Object} data - { username, content }
 * @returns Promise
 */
export function submitFeedbackAPI(data) {
  return request({
    url: '/user/feedback/submit',
    method: 'post',
    data
  })
}

export function updateProfileAPI(data) {
  return request({
    url: '/user/profile/update',
    method: 'put',
    data
  })
}

export function getMyProfileAPI(username) {
  return request({
    url: '/profile/me',
    method: 'get',
    params: { username }
  })
}
