import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const token = ref(sessionStorage.getItem('token') || '')
  const username = ref(sessionStorage.getItem('username') || '')
  const avatar = ref(sessionStorage.getItem('avatar') || '')
  const bio = ref(
    sessionStorage.getItem('bio') || '这个人十分神秘，什么都没留下哟'
  )

  // 登录状态
  const isLoggedIn = ref(!!sessionStorage.getItem('token'))

  // 标签处理
  let safeTags = []

  try {
    const rawTags = sessionStorage.getItem('tags')

    if (rawTags && rawTags !== 'undefined') {
      safeTags = JSON.parse(rawTags)
    }
  } catch (error) {
    console.error('tags 解析失败:', error)
    sessionStorage.removeItem('tags')
  }

  const tags = ref(safeTags)

  // 登录
  const login = (userInfo) => {
    token.value = userInfo.token || ''
    username.value = userInfo.username || ''
    avatar.value = userInfo.avatar || ''
    tags.value = userInfo.tags || []

    isLoggedIn.value = true

    // 个性签名
    if (userInfo.username === 'student') {
      bio.value = '路漫漫其修远兮，吾将上下而求索。'
    } else {
      bio.value = '这个人十分神秘，什么都没留下哟'
    }

    // 存储 session
    sessionStorage.setItem('token', token.value)
    sessionStorage.setItem('username', username.value)
    sessionStorage.setItem('avatar', avatar.value)
    sessionStorage.setItem('bio', bio.value)
    sessionStorage.setItem('role', userInfo.role || '')

    sessionStorage.setItem(
      'tags',
      JSON.stringify(userInfo.tags || [])
    )
  }

  // 退出登录
  const logout = () => {
    token.value = ''
    username.value = ''
    avatar.value = ''
    tags.value = []
    bio.value = '这个人十分神秘，什么都没留下哟'

    isLoggedIn.value = false

    sessionStorage.clear()
  }

  // 更新头像
  const updateAvatar = (url) => {
    avatar.value = url || ''
    sessionStorage.setItem('avatar', avatar.value)
  }

  // 更新简介
  const updateBio = (newBio) => {
    bio.value = newBio || '这个人十分神秘，什么都没留下哟'
    sessionStorage.setItem('bio', bio.value)
  }

  return {
    token,
    username,
    avatar,
    bio,
    tags,
    isLoggedIn,

    login,
    logout,
    updateAvatar,
    updateBio
  }
})