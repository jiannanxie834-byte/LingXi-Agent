<template>
  <div class="dashboard-container">
    <div class="welcome-box">
      <h3> 欢迎回来，超级管理员</h3>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminStatsAPI } from '@/api/admin'

// 1. 🌟 在前端把卡片的皮肤和骨架死死固化好，完美对应你的 HTML 模板
const statsCards = ref([
  { title: '全站注册总数', value: '0 人', tag: '活跃学生', bgColor: '#e6f7ff', color: '#1890ff' },
  { title: '知识库储备总数', value: '0 份', tag: '多模态', bgColor: '#f6ffed', color: '#52c41a' },
  { title: '待审核资源', value: '0 件', tag: '安全合规', bgColor: '#fff7e6', color: '#fa8c16' },
  { title: '待处理问题反馈', value: '0 件', tag: '待办', bgColor: '#fff1f0', color: '#f5222d' }
])

const todoCount = ref(0)

// 2. 重新拉取大盘活数据
const fetchDashboardData = async () => {
  try {
    const res = await getAdminStatsAPI()
    
    // 对应原本路由返回的 return {"code": 200, "data": db_service.get_dashboard_stats()}
    if (res && res.code === 200) {
      const stats = res.data // 拿到后端那个扁平的字典
      
      // 3. 精准投喂数字，把后端的“凡间活数据”注入前端的“漂亮皮肤”里
      statsCards.value[0].value = `${stats.total_users} 人`
      statsCards.value[1].value = `${stats.total_resources} 份`
      statsCards.value[2].value = `${stats.pending_resources} 件`
      statsCards.value[3].value = `${stats.pending_feedback} 件`
      
      // 顶部欢迎栏的待办总数
      todoCount.value = stats.todo_count
      
    } else {
      console.error('大盘数据异常:', res.message)
    }
  } catch (error) {
    console.error('大盘加载彻底失败:', error)
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