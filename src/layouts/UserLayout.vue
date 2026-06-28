<template>
  <div class="layout">
    <div class="header">
      <div class="logo" @click="goPage('/')" style="cursor:pointer">灵析学伴 · 数据结构与算法</div>
      
      <div class="header-right">
        <el-button v-if="!userStore.isLoggedIn" type="primary" round @click="goToLogin">
          登录 / 注册
        </el-button>

        <div v-else style="display: flex; align-items: center; gap: 12px;">
          
          <el-button 
            v-if="userStore.role === 'admin'" 
            type="danger" 
            plain 
            size="small"
            @click="goPage('/admin/dashboard')"
          >
             管理控制台
          </el-button>

        <el-popover
          v-if="userStore.role !== 'admin'"
          placement="bottom-end"
          trigger="click"
          width="380"
          popper-class="message-popover"
          @show="fetchMessages"
        >
          <template #reference>
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
              <el-button class="message-button" circle>
                <el-icon><Bell /></el-icon>
              </el-button>
            </el-badge>
          </template>
          <div class="message-panel">
            <div class="message-panel-head">
              <strong>系统消息</strong>
              <el-button link type="primary" :disabled="unreadCount === 0" @click="markAllMessagesRead">
                全部已读
              </el-button>
            </div>
            <div v-if="messageLoading" class="message-empty">正在读取消息...</div>
            <div v-else-if="messages.length === 0" class="message-empty">暂无系统消息</div>
            <div v-else class="message-list">
              <button
                v-for="item in messages"
                :key="item.id"
                type="button"
                class="message-item"
                :class="{ unread: item.status === '未读' }"
                @click="markMessageRead(item)"
              >
                <span class="message-dot"></span>
                <span class="message-body">
                  <span class="message-title">{{ item.title }}</span>
                  <span class="message-content">{{ item.content }}</span>
                  <span class="message-time">{{ item.created_at || '暂无时间' }}</span>
                </span>
              </button>
            </div>
          </div>
        </el-popover>

        <el-dropdown v-if="userStore.role !== 'admin'" @command="handleCommand" trigger="click">
          <div class="user-profile">
            <el-avatar :size="32" :src="userStore.avatar" class="avatar-box">
              {{ displayName ? displayName.charAt(0).toUpperCase() : 'U' }}
            </el-avatar>
            <span class="username">{{ displayName }}</span>
            <span class="arrow-icon">▼</span>
          </div>
          
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="goProfile">个人画像</el-dropdown-item>
              <el-dropdown-item command="logout" divided style="color: #f5222d;">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
</div>

    <div class="content"><router-view /></div>

    <div class="tabbar">
      <div :class="{ 'active': currentPath === '/' }" @click="goPage('/')">首页</div>
      <div :class="{ 'active': currentPath === '/resource' }" @click="goPage('/resource')">资源工厂</div>
      <div :class="{ 'active': currentPath === '/plan' }" @click="goPage('/plan')">规划</div>
      <div :class="{ 'active': currentPath === '/evaluation' }" @click="goPage('/evaluation')">评价</div>
      <div :class="{ 'active': currentPath === '/profile' }" @click="goPage('/profile')">我的</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Bell } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user' // 🌟 引入 Pinia
import {
  getSystemMessagesAPI,
  getUnreadMessageCountAPI,
  markAllMessagesReadAPI,
  markMessageReadAPI
} from '@/api/message'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore() // 🌟 实例化 Pinia Store

const currentPath = computed(() => route.path)
const displayName = computed(() => userStore.nickname || userStore.username || '用户')
const messages = ref([])
const messageLoading = ref(false)
const unreadCount = ref(0)
const unreadPoller = ref(null)
const goPage = (path) => router.push(path)
const goToLogin = () => router.push('/login')

const canLoadMessages = computed(() => {
  return userStore.isLoggedIn && userStore.role !== 'admin' && Boolean(userStore.username)
})

const fetchUnreadCount = async () => {
  if (!canLoadMessages.value) {
    unreadCount.value = 0
    return
  }
  try {
    const res = await getUnreadMessageCountAPI(userStore.username)
    if (res && res.code === 200) {
      unreadCount.value = Number(res.data?.count || 0)
    }
  } catch (error) {
    console.error('读取未读消息数失败:', error)
  }
}

const fetchMessages = async () => {
  if (!canLoadMessages.value) return
  messageLoading.value = true
  try {
    const res = await getSystemMessagesAPI(userStore.username)
    if (res && res.code === 200) {
      messages.value = res.data || []
      unreadCount.value = messages.value.filter(item => item.status === '未读').length
    }
  } catch (error) {
    console.error('读取系统消息失败:', error)
  } finally {
    messageLoading.value = false
  }
}

const markMessageRead = async (item) => {
  if (!item || item.status === '已读') return
  try {
    const res = await markMessageReadAPI(userStore.username, item.id)
    if (res && res.code === 200) {
      item.status = '已读'
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  } catch (error) {
    console.error('标记消息已读失败:', error)
  }
}

const markAllMessagesRead = async () => {
  if (!canLoadMessages.value) return
  try {
    const res = await markAllMessagesReadAPI(userStore.username)
    if (res && res.code === 200) {
      messages.value = messages.value.map(item => ({ ...item, status: '已读' }))
      unreadCount.value = 0
    }
  } catch (error) {
    console.error('全部标记已读失败:', error)
  }
}

const stopUnreadPolling = () => {
  if (unreadPoller.value) {
    window.clearInterval(unreadPoller.value)
    unreadPoller.value = null
  }
}

const startUnreadPolling = () => {
  stopUnreadPolling()
  if (!canLoadMessages.value) return
  unreadPoller.value = window.setInterval(fetchUnreadCount, 20000)
}

const handleCommand = (command) => {
  if (command === 'goProfile') {
    router.push('/profile')
  } else if (command === 'logout') {
    userStore.logout() //  调用 Pinia 清空数据
    ElMessage.warning('已安全退出登录')
    router.push('/') 
  }
}

watch(
  [() => userStore.isLoggedIn, () => userStore.username, () => userStore.role],
  () => {
    fetchUnreadCount()
    startUnreadPolling()
  }
)

onMounted(() => {
  fetchUnreadCount()
  startUnreadPolling()
})

onBeforeUnmount(() => {
  stopUnreadPolling()
})
</script>

<style scoped>
.layout { 
  height: 100vh; 
  display: flex; 
  flex-direction: column; 
}
.header { 
  height: 48px; 
  border-bottom: 1px solid #eee; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0 20px; 
  background-color: #fff; 
  flex-shrink: 0;
}
.logo { 
  font-size: 17px; 
  font-weight: bold; 
  color: #333; 
}
.user-profile { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  cursor: pointer; 
  padding: 3px 10px; 
  border-radius: 18px; 
  transition: background 0.2s; 
  user-select: none; 
}
.user-profile:hover { 
  background-color: #f5f5f5; 
}
.message-button {
  width: 32px;
  height: 32px;
}
.message-panel {
  max-height: 420px;
  display: flex;
  flex-direction: column;
}
.message-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  color: #1f2937;
}
.message-empty {
  padding: 24px 0;
  color: #8c8c8c;
  text-align: center;
  font-size: 13px;
}
.message-list {
  max-height: 340px;
  overflow-y: auto;
}
.message-item {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr);
  gap: 9px;
  width: 100%;
  padding: 12px 0;
  border: 0;
  border-bottom: 1px solid #f5f5f5;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.message-item:last-child {
  border-bottom: 0;
}
.message-item:hover .message-title {
  color: #1677ff;
}
.message-dot {
  width: 7px;
  height: 7px;
  margin-top: 6px;
  border-radius: 50%;
  background: transparent;
}
.message-item.unread .message-dot {
  background: #1677ff;
}
.message-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.message-title {
  color: #1f2937;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
}
.message-content {
  display: -webkit-box;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-line;
  word-break: break-word;
  overflow: hidden;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.message-time {
  color: #9ca3af;
  font-size: 11px;
}
.username { 
  font-size: 14px; 
  color: #333; 
  font-weight: 500; 
}
.arrow-icon { 
  font-size: 10px; 
  color: #999; 
}
.content { 
  flex: 1; 
  overflow: auto; 
  min-height: 0;
}
.tabbar { 
  height: 48px; 
  border-top: 1px solid #eee; 
  display: flex; 
  background: #fff; 
  flex-shrink: 0;
}
.tabbar div { 
  flex: 1; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  cursor: pointer; 
  font-size: 14px; 
  color: #666; 
  transition: all 0.2s; 
}
.tabbar div.active { 
  color: #1890ff; 
  font-weight: bold; 
  }
</style>
