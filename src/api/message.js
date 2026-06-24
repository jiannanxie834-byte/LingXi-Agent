import request from '@/utils/request'

export const getSystemMessagesAPI = (username) => request({
  url: '/user/messages/list',
  method: 'get',
  params: { username }
})

export const getUnreadMessageCountAPI = (username) => request({
  url: '/user/messages/unread-count',
  method: 'get',
  params: { username }
})

export const markMessageReadAPI = (username, id) => request({
  url: '/user/messages/read',
  method: 'post',
  data: { username, id }
})

export const markAllMessagesReadAPI = (username) => request({
  url: '/user/messages/read-all',
  method: 'post',
  data: { username }
})
