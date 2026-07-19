import request from '@/utils/request'

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
