import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // ================= 1. 响应式状态定义 (从会话恢复) =================
  const token = ref(sessionStorage.getItem('token') || '')
  const username = ref(sessionStorage.getItem('username') || '')
  const nickname = ref(sessionStorage.getItem('nickname') || '')
  const avatar = ref(sessionStorage.getItem('avatar') || '')
  const hours = ref(Number(sessionStorage.getItem('hours') || 0))
  const profileDimensions = ref({})
  const profileRadar = ref({})
  const profileUpdatedAt = ref(sessionStorage.getItem('profileUpdatedAt') || '')

  //   1：补上角色状态，这关系到你的管理员任意门！
  const role = ref(sessionStorage.getItem('role') || '')

  // 个性签名：正常读取缓存，若没有则给个 UI 兜底提示
  const bio = ref(sessionStorage.getItem('bio') || '这个人十分神秘，什么都没留下哟')

  // 登录状态：有 token 就认为已登录
  const isLoggedIn = ref(!!sessionStorage.getItem('token'))

  // 标签处理：安全解析 JSON
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

  try {
    const rawDimensions = sessionStorage.getItem('profileDimensions')
    if (rawDimensions) profileDimensions.value = JSON.parse(rawDimensions)
    const rawRadar = sessionStorage.getItem('profileRadar')
    if (rawRadar) profileRadar.value = JSON.parse(rawRadar)
  } catch (error) {
    console.error('画像数据解析失败:', error)
    sessionStorage.removeItem('profileDimensions')
    sessionStorage.removeItem('profileRadar')
  }

  // ================= 2. 核心动作 (Actions) =================

  // 登录动作：完全信任并接收后端吐出的数据包 (userInfo)
  const login = (userInfo) => {
    token.value = userInfo.token || ''
    username.value = userInfo.username || ''
    nickname.value = userInfo.nickname || userInfo.username || ''
    avatar.value = userInfo.avatar || ''
    hours.value = Number(userInfo.hours || 0)
    tags.value = userInfo.tags || []

    //  2：接收后端的 role
    role.value = userInfo.role || 'student'

    // 如果后端传了 bio 就用后端的，没传再用默认兜底
    bio.value = userInfo.bio || '这个人十分神秘，什么都没留下哟'

    isLoggedIn.value = true

    //  统一存入 Session
    sessionStorage.setItem('token', token.value)
    sessionStorage.setItem('username', username.value)
    sessionStorage.setItem('nickname', nickname.value)
    sessionStorage.setItem('avatar', avatar.value)
    sessionStorage.setItem('hours', String(hours.value))
    sessionStorage.setItem('role', role.value)
    sessionStorage.setItem('bio', bio.value)
    sessionStorage.setItem('tags', JSON.stringify(tags.value))
  }

  // 退出登录：物理级清空
  const logout = () => {
    token.value = ''
    username.value = ''
    nickname.value = ''
    avatar.value = ''
    hours.value = 0
    role.value = '' // 剥夺身份
    tags.value = []
    profileDimensions.value = {}
    profileRadar.value = {}
    profileUpdatedAt.value = ''
    bio.value = '这个人十分神秘，什么都没留下哟'

    isLoggedIn.value = false
    sessionStorage.clear()
  }

  // 更新头像 (用户自己在个人中心修改后调用)
  const updateAvatar = (url) => {
    avatar.value = url || ''
    sessionStorage.setItem('avatar', avatar.value)
  }

  // 更新简介 (用户自己在个人中心修改后调用)
  const updateBio = (newBio) => {
    bio.value = newBio || '这个人十分神秘，什么都没留下哟'
    sessionStorage.setItem('bio', bio.value)
  }

  const updateNickname = (newNickname) => {
    nickname.value = newNickname || username.value
    sessionStorage.setItem('nickname', nickname.value)
  }

  const updateLearningProfile = (profile = {}) => {
    const knowledgeTags = Array.isArray(profile.knowledge_tags) ? profile.knowledge_tags : profile.tags
    if (Array.isArray(knowledgeTags)) {
      tags.value = knowledgeTags
      sessionStorage.setItem('tags', JSON.stringify(tags.value))
    }
    if (typeof profile.hours === 'number') {
      hours.value = profile.hours
      sessionStorage.setItem('hours', String(hours.value))
    }
    if (profile.dimensions && typeof profile.dimensions === 'object') {
      profileDimensions.value = profile.dimensions
      sessionStorage.setItem('profileDimensions', JSON.stringify(profileDimensions.value))
    }
    if (profile.radar && typeof profile.radar === 'object') {
      profileRadar.value = profile.radar
      sessionStorage.setItem('profileRadar', JSON.stringify(profileRadar.value))
    }
    profileUpdatedAt.value = profile.updated_at || new Date().toISOString()
    sessionStorage.setItem('profileUpdatedAt', profileUpdatedAt.value)
  }

  // ================= 3. 暴露给组件使用 =================
  return {
    token,
    username,
    nickname,
    avatar,
    hours,
    profileDimensions,
    profileRadar,
    profileUpdatedAt,
    role,
    bio,
    tags,
    isLoggedIn,

    login,
    logout,
    updateAvatar,
    updateBio,
    updateNickname,
    updateLearningProfile
  }
})
