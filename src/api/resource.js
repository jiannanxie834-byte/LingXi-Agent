import request from '@/utils/request'

export const getPassedResourcesAPI = () => request({ url: '/resource/list/passed', method: 'get' })
export const uploadResourceAPI = (data) => request({ url: '/resource/upload', method: 'post', data })
export const getPassedTypesAPI = () => request({ url: '/resource/types/passed', method: 'get' })
export const proposeTypeAPI = (name) => request({ url: '/resource/types/propose', method: 'post', data: { name } })
