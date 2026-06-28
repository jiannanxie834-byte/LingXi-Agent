import request from '@/utils/request'

export const getDsaCourseFrameworkAPI = () => request({
  url: '/course/data-structures-algorithms/framework',
  method: 'get'
})

export const validateDsaCourseFrameworkAPI = () => request({
  url: '/course/data-structures-algorithms/framework/validate',
  method: 'get'
})
