import request from '@/utils/request'

export const getVideoCatalogAPI = () => request({
  url: '/video/catalog',
  method: 'get'
})

export const getVideoRecommendationsAPI = (params = {}) => request({
  url: '/video/recommendations',
  method: 'get',
  params
})
