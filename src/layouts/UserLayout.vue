<template>
  <div class="layout">
    <div class="header">
      <div class="logo" @click="goPage('/')" style="cursor:pointer">灵析学伴</div>
      
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

        <el-dropdown v-else @command="handleCommand" trigger="click">
          <div class="user-profile">
            <el-avatar :size="36" :src="userStore.avatar" class="avatar-box">
              {{ userStore.username ? userStore.username.charAt(0).toUpperCase() : 'U' }}
            </el-avatar>
            <span class="username">{{ userStore.username }}</span>
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
      <div :class="{ 'active': currentPath === '/resource' }" @click="goPage('/resource')">资源</div>
      <div :class="{ 'active': currentPath === '/plan' }" @click="goPage('/plan')">规划</div>
      <div :class="{ 'active': currentPath === '/evaluation' }" @click="goPage('/evaluation')">评价</div>
      <div :class="{ 'active': currentPath === '/profile' }" @click="goPage('/profile')">我的</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user' // 🌟 引入 Pinia

const router = useRouter()
const route = useRoute()
const userStore = useUserStore() // 🌟 实例化 Pinia Store

const currentPath = computed(() => route.path)
const goPage = (path) => router.push(path)
const goToLogin = () => router.push('/login')

const handleCommand = (command) => {
  if (command === 'goProfile') {
    router.push('/profile')
  } else if (command === 'logout') {
    userStore.logout() //  调用 Pinia 清空数据
    ElMessage.warning('已安全退出登录')
    router.push('/') 
  }
}
</script>

<style scoped>
.layout { 
  height: 100vh; 
  display: flex; 
  flex-direction: column; 
}
.header { 
  height: 60px; 
  border-bottom: 1px solid #eee; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0 24px; 
  background-color: #fff; 
}
.logo { 
  font-size: 18px; 
  font-weight: bold; 
  color: #333; 
}
.user-profile { 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  cursor: pointer; 
  padding: 4px 12px; 
  border-radius: 20px; 
  transition: background 0.2s; 
  user-select: none; 
}
.user-profile:hover { 
  background-color: #f5f5f5; 
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
}
.tabbar { 
  height: 60px; 
  border-top: 1px solid #eee; 
  display: flex; 
  background: #fff; 
}
.tabbar div { 
  flex: 1; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  cursor: pointer; 
  font-size: 15px; 
  color: #666; 
  transition: all 0.2s; 
}
.tabbar div.active { 
  color: #1890ff; 
  font-weight: bold; 
  }
</style>
