<template>
  <div class="dashboard-container">
    <div class="welcome-box">
      <h3>👑 欢迎回来，超级管理员</h3>
      <p>系统大盘数据实时通电中，当前有 <el-tag type="danger" size="small" effect="dark">{{ todoCount }}</el-tag> 项核心待办事件需要处理。</p>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="(item, index) in statsCards" :key="index">
        <el-card shadow="hover" :body-style="{ padding: '20px' }" class="stats-card">
          <div class="card-body">
            <div class="card-icon-box" :style="{ backgroundColor: item.bgColor, color: item.color }">
              <span class="card-tag">{{ item.tag }}</span>
            </div>
            <div class="card-info">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-value" :style="{ color: item.color }">{{ item.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="content-row">
      <el-col :span="24">
        <el-card shadow="never" class="todo-list-card">
          <template #header>
            <div class="card-header">
              <span>📋 快捷管理通道</span>
            </div>
          </template>
          <div class="shortcut-buttons">
            <el-button type="primary" plain @click="$router.push('/admin/user')">学生用户管理</el-button>
            <el-button type="warning" plain @click="$router.push('/admin/feedback')">问题反馈中心</el-button>
            <el-button type="success" plain @click="$router.push('/admin/resource')">资源库审核</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminStatsAPI } from '@/api/admin'

const statsCards = ref([])
const todoCount = ref(0)

// 🌟 核心：拉取后端全真大盘数据
const fetchDashboardData = async () => {
  try {
    const res = await getAdminStatsAPI()
    if (res.code === 200) {
      statsCards.value = res.data
      todoCount.value = res.todoCount
    }
  } catch (error) {
    console.error('管理员大盘活数据加载失败:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard-container { 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
}
.welcome-box { 
  background: #fff; 
  padding: 20px; 
  border-radius: 8px; 
  border: 1px solid #f0f0f0; 
}
.welcome-box h3 { 
  margin: 0 0 8px 0; 
  color: #333; 
}
.welcome-box p { 
  margin: 0; 
  color: #666; 
  font-size: 14px; 
}
.stats-row { 
  margin-top: 10px; 
}
.stats-card { 
  border-radius: 8px; 
  border: 1px solid #eef0f3; 
}
.card-body { 
  display: flex; 
  align-items: center; 
  gap: 16px; 
}
.card-icon-box { 
  width: 56px; 
  height: 56px; 
  border-radius: 8px; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 12px; 
  font-weight: bold; 
  text-align: center; 
  padding: 4px; 
}
.card-info { 
  flex: 1; 
}
.card-title { 
  font-size: 14px; 
  color: #8c8c8c; 
  margin-bottom: 4px; 
}
.card-value { 
  font-size: 24px; 
  font-weight: bold; 
}
.content-row { 
  margin-top: 10px; 
}
.todo-list-card { 
  border-radius: 8px; 
}
.shortcut-buttons { 
  display: flex; 
  gap: 16px; 
  padding: 10px 0; 
  }
</style>