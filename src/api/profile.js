import request from '@/utils/request'

export const getMyProfileAPI = (username = 'student') => request({
  url: '/profile/me',
  method: 'get',
  params: { username }
})

export const getMyProfileEventsAPI = (username = 'student', limit = 30) => request({
  url: '/profile/me/events',
  method: 'get',
  params: { username, limit }
})
