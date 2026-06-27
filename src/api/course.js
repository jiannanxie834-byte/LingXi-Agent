import request from '@/utils/request'

export const getDeepLearningCourseMapAPI = () => request({
  url: '/course/deep-learning/map',
  method: 'get'
})

export const getDeepLearningUnitsAPI = () => request({
  url: '/course/deep-learning/units',
  method: 'get'
})

export const matchDeepLearningTopicAPI = (params = {}) => request({
  url: '/course/deep-learning/match',
  method: 'get',
  params
})

export const getDeepLearningVideoCatalogAPI = () => request({
  url: '/course/deep-learning/video/catalog',
  method: 'get'
})

export const getDeepLearningVideoRecommendationsAPI = (params = {}) => request({
  url: '/course/deep-learning/video/recommendations',
  method: 'get',
  params
})
