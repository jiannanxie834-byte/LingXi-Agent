import request from '@/utils/request'

export function getTodoListAPI(username) {
  return request({
    url: '/todo/list',
    method: 'get',
    params: { username }
  })
}

export function saveTodoAPI(username, todos) {
  return request({
    url: '/todo/save',
    method: 'post',
    data: { username, todos }
  })
}