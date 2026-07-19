import request from '@/utils/request'

export const getGenerationJobAPI = (jobId) => request({
  url: `/generation/jobs/${jobId}`,
  method: 'get'
})

export const getGenerationJobEventsAPI = (jobId) => request({
  url: `/generation/jobs/${jobId}/events`,
  method: 'get'
})
