import request from '@/utils/request'

export const getPassedResourcesAPI = () => request({ url: '/resource/list/passed', method: 'get' })
export const getAllResourcesAPI = () => request({ url: '/resource/list/all', method: 'get' })
export const uploadResourceAPI = (data) => request({ url: '/resource/upload', method: 'post', data })
export const approveResourceAPI = (id) => request({ url: `/resource/approve/${id}`, method: 'post' })
export const rejectResourceAPI = (id) => request({ url: `/resource/reject/${id}`, method: 'delete' })
export const getPassedTypesAPI = () => request({ url: '/resource/types/passed', method: 'get' })
export const getAllTypesAPI = () => request({ url: '/resource/types/all', method: 'get' })
export const proposeTypeAPI = (name) => request({ url: '/resource/types/propose', method: 'post', data: { name } })
export const approveTypeAPI = (name) => request({ url: '/resource/types/approve', method: 'post', data: { name } })
