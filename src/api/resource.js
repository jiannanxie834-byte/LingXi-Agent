import request from '@/utils/request'

export const getPassedResourcesAPI = () => request({ url: '/resource/list/passed', method: 'get' })
export const getRecommendedResourcesAPI = (username, limit = 12) => request({
  url: '/resource/recommendations',
  method: 'get',
  params: { username, limit }
})
export const uploadResourceAPI = (data) => request({ url: '/resource/upload', method: 'post', data })
export const getPassedTypesAPI = () => request({ url: '/resource/types/passed', method: 'get' })
export const proposeTypeAPI = (name, username = '', reason = '') => request({
  url: '/resource/types/propose',
  method: 'post',
  data: { name, username, reason }
})
