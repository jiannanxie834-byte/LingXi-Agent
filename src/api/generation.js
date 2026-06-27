import request from '@/utils/request'

export const createGenerationJobAPI = (data = {}) => request({
  url: '/generation/jobs',
  method: 'post',
  data
})

export const getGenerationJobAPI = (jobId) => request({
  url: `/generation/jobs/${encodeURIComponent(jobId)}`,
  method: 'get'
})

export const getGenerationJobEventsAPI = (jobId) => request({
  url: `/generation/jobs/${encodeURIComponent(jobId)}/events`,
  method: 'get'
})

export const getGenerationJobArtifactsAPI = (jobId) => request({
  url: `/generation/jobs/${encodeURIComponent(jobId)}/artifacts`,
  method: 'get'
})
