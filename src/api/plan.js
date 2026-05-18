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

// 删除整条路线
export function deleteRouteAPI(username, routeId) {
  return request({
    url: '/plan/route/delete',
    method: 'delete',
    params: { username, route_id: routeId }
  })
}

// 删除路线中的单个节点
export function deleteNodeAPI(username, routeId, nodeId) {
  return request({
    url: '/plan/node/delete',
    method: 'delete',
    params: { username, route_id: routeId, node_id: nodeId }
  })
}