<template>
  <div class="admin-layout">
    <el-container class="layout-container">
      <el-aside width="240px" class="aside">
        <div class="admin-logo">灵析学伴 · 管理后台</div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#1890ff"
          router
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>控制台概览</span>
          </el-menu-item>
          <el-menu-item index="/admin/resource">
            <el-icon><Files /></el-icon>
            <span>资源库审核与管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/user">
            <el-icon><User /></el-icon>
            <span>学生用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/feedback">
            <el-icon><ChatLineSquare /></el-icon>
            <span>问题反馈中心</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header class="admin-header">
          <div class="breadcrumb">系统管理 / {{ pageTitle }}</div>
          
          <div class="admin-info" style="display: flex; align-items: center; gap: 15px;">
            
            <el-button 
              type="primary" 
              plain 
              size="small"
              @click="$router.push('/')"
            >
               返回学生前台
            </el-button>

            <el-tag type="danger" effect="dark" class="role-tag">超级管理员</el-tag>
            <el-button link type="primary" @click="handleLogout">退出登录</el-button>
          </div>
        </el-header>

        <el-main class="admin-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Odometer, Files, User, ChatLineSquare } from '@element-plus/icons-vue'

//  1. 引入 Pinia 用户状态中心
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore() // 2. 实例化 Store

// 动态激活高亮菜单
const activeMenu = computed(() => route.path)

// 动态获取当前页面标题
const pageTitle = computed(() => {
  const map = {
    '/admin/dashboard': '控制台概览',
    '/admin/resource': '资源库管理',
    '/admin/user': '学生用户管理',
    '/admin/feedback': '问题反馈中心'
  }
  return map[route.path] || '管理中心'
})

//  3. 彻底重写退出逻辑，断掉所有前朝残留缓存
const handleLogout = () => {
  userStore.logout() // 一刀切断 Local Storage 里的 token 和 admin 信息
  ElMessage.warning('管理员已安全退出管理后台')
  router.push('/') //  退出后安全踢回主页，彻底闭环
}
</script>

<style scoped>
.admin-layout { 
  height: 100vh; 
  width: 100vw; 
  overflow: hidden; 
}
.layout-container { 
  height: 100%; 
}
.aside { 
  background-color: #001529; 
  display: flex; 
  flex-direction: column; 
}
.admin-logo { 
  height: 60px; 
  line-height: 60px; 
  text-align: center; 
  color: #fff; 
  font-weight: bold; 
  font-size: 16px; 
  background: #002140; 
  letter-spacing: 1px; 
}
.el-menu-vertical { 
  border-right: none; 
  flex: 1; 
}
.admin-header { 
  background: #fff; 
  border-bottom: 1px solid #f0f0f0; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  padding: 0 24px; 
}
.breadcrumb { 
  font-size: 14px; 
  color: #666; 
}
.admin-info { 
  display: flex; 
  align-items: center; 
  gap: 16px; 
}
.role-tag { 
  font-weight: bold; 
}
.admin-main { 
  background-color: #f5f7fa; 
  padding: 24px; 
  overflow-y: auto; 
  }
</style>