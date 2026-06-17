<template>
  <div class="dashboard-container">
    <div class="welcome-box">
      <h3> 欢迎回来，超级管理员</h3>
      <p>
        系统大盘数据实时通电中，当前有
        <el-tag type="danger" size="small" effect="dark">{{ todoCount }}</el-tag>
        项核心待办事件需要处理。
        <span class="todo-breakdown">
          资源审核 {{ todoBreakdown.resources }} 件 · 分类审核 {{ todoBreakdown.types }} 类 · 反馈处理 {{ todoBreakdown.feedback }} 件
        </span>
      </p>
    </div>

    <div class="stats-grid">
      <el-card
        v-for="(item, index) in statsCards"
        :key="index"
        shadow="hover"
        :body-style="{ padding: '20px' }"
        class="stats-card"
      >
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
    </div>

    <el-row :gutter="20" class="content-row">
      <el-col :span="24">
        <el-card shadow="never" class="todo-list-card">
          <template #header>
            <div class="card-header">
              <span> 快捷管理通道</span>
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

    <el-card shadow="never" class="readiness-card">
      <template #header>
        <div class="card-header">
          <span>演示就绪检查</span>
          <el-tag :type="readiness.ready ? 'success' : 'warning'" effect="plain">
            {{ readiness.ready ? '已就绪' : '待补齐' }}
          </el-tag>
        </div>
      </template>
      <div class="readiness-grid">
        <div
          v-for="item in readiness.checks"
          :key="item.key"
          class="readiness-item"
          :class="{ ok: item.ok }"
        >
          <div class="readiness-top">
            <span class="readiness-label">{{ item.label }}</span>
            <el-tag size="small" :type="item.ok ? 'success' : 'warning'" effect="light">
              {{ item.ok ? '通过' : '待处理' }}
            </el-tag>
          </div>
          <div class="readiness-value">{{ item.value }}</div>
          <div class="readiness-target">{{ item.target }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminReadinessAPI, getAdminStatsAPI } from '@/api/admin'

// 1.  在前端把卡片的皮肤和骨架死死固化好，完美对应你的 HTML 模板
const statsCards = ref([
  { title: '全站注册总数', value: '0 人', tag: '活跃学生', bgColor: '#e6f7ff', color: '#1890ff' },
  { title: '知识库储备总数', value: '0 份', tag: '资源库', bgColor: '#f6ffed', color: '#52c41a' },
  { title: '待审核资源', value: '0 件', tag: '安全合规', bgColor: '#fff7e6', color: '#fa8c16' },
  { title: '待审核资源分类', value: '0 类', tag: '分类治理', bgColor: '#f9f0ff', color: '#722ed1' },
  { title: '待处理问题反馈', value: '0 件', tag: '待办', bgColor: '#fff1f0', color: '#f5222d' }
])

const todoCount = ref(0)
const todoBreakdown = ref({
  resources: 0,
  types: 0,
  feedback: 0
})
const readiness = ref({
  ready: false,
  checks: []
})

// 2. 重新拉取大盘活数据
const fetchDashboardData = async () => {
  try {
    const res = await getAdminStatsAPI()
    
    // 对应原本路由返回的 return {"code": 200, "data": db_service.get_dashboard_stats()}
    if (res && res.code === 200) {
      const stats = res.data || {}
      
      // 3. 精准投喂数字，把后端的“凡间活数据”注入前端的“漂亮皮肤”里
      statsCards.value[0].value = `${stats.total_users} 人`
      statsCards.value[1].value = `${stats.total_resources} 份`
      statsCards.value[2].value = `${stats.pending_resources} 件`
      statsCards.value[3].value = `${stats.pending_types || 0} 类`
      statsCards.value[4].value = `${stats.pending_feedback} 件`
      
      // 顶部欢迎栏的待办总数
      todoCount.value = stats.todo_count
      todoBreakdown.value = {
        resources: stats.pending_resources || 0,
        types: stats.pending_types || 0,
        feedback: stats.pending_feedback || 0
      }
      
    } else {
      console.error('大盘数据异常:', res.message)
    }
  } catch (error) {
    console.error('大盘加载彻底失败:', error)
  }
}

const fetchReadiness = async () => {
  try {
    const res = await getAdminReadinessAPI()
    if (res && res.code === 200) {
      readiness.value = res.data || { ready: false, checks: [] }
    }
  } catch (error) {
    console.error('演示就绪度加载失败:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
  fetchReadiness()
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
.todo-breakdown {
  color: #8c8c8c;
  margin-left: 8px;
}
.stats-grid { 
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 20px;
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

.readiness-card {
  border-radius: 8px;
  border: 1px solid #eef0f3;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.readiness-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.readiness-item {
  padding: 14px;
  border-radius: 8px;
  border: 1px solid #f3d19e;
  background: #fffaf0;
}

.readiness-item.ok {
  border-color: #b7eb8f;
  background: #f6ffed;
}

.readiness-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.readiness-label {
  min-width: 0;
  color: #1f2937;
  font-weight: 700;
  font-size: 14px;
}

.readiness-value {
  margin-top: 8px;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.readiness-target {
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 1180px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .readiness-grid {
    grid-template-columns: 1fr;
  }
}
</style>
