// src/api/plan.js
import request from '@/utils/request'

// 获取指定用户的规划路线
export function getPlanListAPI(username) {
  return request({
    url: '/plan/list',
    method: 'get',
    params: { username }
  })
}

// 保存指定用户的完整规划路线
export function savePlanAPI(username, plans) {
  return request({
    url: '/plan/save',
    method: 'post',
    data: { username, plans }
  })
}

// 删除整条路线
export function deleteRouteAPI(username, routeId) {
  return request({
    url: '/plan/route/delete',
    method: 'delete',
    params: { username, route_id: routeId }
  })
}
