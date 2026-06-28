import request from '@/utils/request'

export const getPassedResourcesAPI = () => request({ url: '/resource/list/passed', method: 'get' })
export const getPassedResourceBundlesAPI = () => request({ url: '/resource/bundles/passed', method: 'get' })
export const getChapterResourceHubsAPI = () => request({ url: '/resource/chapter-hubs', method: 'get' })
export const getDsaCourseTreeAPI = () => request({
  url: '/resource/course/tree',
  method: 'get'
})
export const getDsaChapterDetailAPI = (chapterId) => request({
  url: `/resource/course/chapter/${encodeURIComponent(chapterId)}`,
  method: 'get'
})
export const getDsaSectionDetailAPI = (chapterId, sectionId) => request({
  url: `/resource/course/section/${encodeURIComponent(chapterId)}/${encodeURIComponent(sectionId)}`,
  method: 'get'
})
export const getResourceArtifactsAPI = (params = {}) => request({
  url: '/resource/artifacts',
  method: 'get',
  params
})
export const getResourceArtifactAPI = (artifactId) => request({
  url: `/resource/artifacts/${artifactId}`,
  method: 'get'
})
export const getRecommendedResourcesAPI = (username, limit = 80) => request({
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
