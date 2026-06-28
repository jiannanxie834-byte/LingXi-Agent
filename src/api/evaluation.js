import request from '@/utils/request'

export const submitEvaluationAPI = (data) => request({
  url: '/evaluation/submit',
  method: 'post',
  data
})

export const autoEvaluationAPI = (username) => request({
  url: '/evaluation/auto',
  method: 'post',
  data: { username }
})

export const getEvaluationHistoryAPI = (username) => request({
  url: '/evaluation/history',
  method: 'get',
  params: { username }
})

export const generateRemediationPackageAPI = (data) => request({
  url: '/evaluation/remediation-package',
  method: 'post',
  data
})
