import request from '@/utils/request'

export const sendChatMessageAPI = (data) => request({
  url: '/chat/send',
  method: 'post',
  data
})
