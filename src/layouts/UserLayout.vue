<template>
  <div class="layout">

    <div class="header">
      <div class="logo">灵析学伴</div>
      
      <div class="header-right">
        <el-button 
          v-if="!isLoggedIn" 
          type="primary" 
          round 
          @click="mockLogin"
        >
          登录 / 注册
        </el-button>

        <el-dropdown v-else @command="handleCommand" trigger="click">
          <div class="user-profile">
            <el-avatar 
              :size="36" 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            />
            <span class="username">李同学</span>
            <span class="arrow-icon">▼</span>
          </div>
          
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="goProfile">个人画像</el-dropdown-item>
              <el-dropdown-item command="feedback">问题反馈</el-dropdown-item>
              <el-dropdown-item command="logout" divided style="color: #f5222d;">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="content">
      <router-view />
    </div>

    <div class="tabbar">
      <div :class="{ 'active': currentPath === '/' }" @click="goPage('/')">首页</div>
      <div :class="{ 'active': currentPath === '/resource' }" @click="goPage('/resource')">资源</div>
      <div :class="{ 'active': currentPath === '/plan' }" @click="goPage('/plan')">规划</div>
      <div :class="{ 'active': currentPath === '/profile' }" @click="goPage('/profile')">我的</div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus' // 引入组件库的轻量消息提示

const router = useRouter()
const route = useRoute()

// 🌟 核心开关：当前是否登录（暂时用 ref 模拟，true为已登，false为未登）
const isLoggedIn = ref(false)

// 动态追踪当前路由路径，用来激活底部蓝字高亮
const currentPath = computed(() => route.path)

const goPage = (path) => {
  router.push(path)
}

// 模拟登录
const mockLogin = () => {
  isLoggedIn.value = true
  ElMessage.success('欢迎回来，李同学！')
}

// 处理下拉菜单的跳转与登出
const handleCommand = (command) => {
  if (command === 'goProfile') {
    router.push('/profile')
  } else if (command === 'feedback') {
    ElMessage.info('反馈功能正在建设中...')
  } else if (command === 'logout') {
    isLoggedIn.value = false
    ElMessage.warning('已安全退出登录')
    router.push('/') // 登出后强制退回首页
  }
}
</script>

<style scoped>
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ================= 顶栏全新双端 Flex 布局 ================= */
.header {
  height: 60px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between; /* 🌟 核心：让 logo 靠左，登录控制区靠右 */
  align-items: center;
  padding: 0 24px;
  background-color: #fff;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* 用户头像名字块 */
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

/* ================= 页面主体与底部 ================= */
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

/* 🌟 底部当前所在页面的高亮状态 */
.tabbar div.active {
  color: #1890ff;
  font-weight: bold;
}
</style>