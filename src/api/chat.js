import request from '@/utils/request'

export const getChatSessionsAPI = (username) => request({
  url: '/chat/sessions',
  method: 'get',
  params: { username }
})

export const getChatMessagesAPI = (sessionId, username) => request({
  url: `/chat/sessions/${sessionId}/messages`,
  method: 'get',
  params: { username }
})

export const sendChatMessageAPI = (data) => request({
  url: '/chat/send',
  method: 'post',
  data
})
