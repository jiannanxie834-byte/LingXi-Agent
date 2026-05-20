<template>
  <div class="admin-feedback-page" v-loading="loading">
    <div class="header-title">
      <h2> 学生问题反馈中心</h2>
      <p>实时查看并处理学生在前台提交的系统报错、改进建议与 AI 生成异常通知</p>
    </div>

    <el-table :data="feedbackList" border stripe style="width: 100%; margin-top: 20px;">
      <el-table-column prop="id" label="反馈编码" width="100" align="center" />
      <el-table-column prop="username" label="学生账号" width="140" />
      <el-table-column prop="content" label="反馈具体内容" min-width="300" show-overflow-tooltip />
      <el-table-column prop="date" label="提交时间" width="160" align="center" />
      
      <el-table-column label="当前状态" width="120" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === '已处理' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="管理维护" width="180" align="center">
        <template #default="scope">
          <el-button 
            size="small" 
            type="success" 
            :disabled="scope.row.status === '已处理'"
            @click="handleProcess(scope.row)"
          >
            处理
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 引入活接口
import { getAllFeedbackAPI, processFeedbackAPI, deleteFeedbackAPI } from '@/api/admin'

const loading = ref(false)
const feedbackList = ref([])

// 1. 核心：从后端拉取全量用户反馈
const fetchFeedbacks = async () => {
  loading.value = true
  try {
    const res = await getAllFeedbackAPI()
    if (res && res.code === 200) {
      feedbackList.value = res.data
    }
  } catch (error) {
    console.error('拉取反馈数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 2. 核心：响应管理员点击【处理】
const handleProcess = async (row) => {
  try {
    const res = await processFeedbackAPI(row.id)
    if (res && res.code === 200) {
      ElMessage.success('归档成功！已将该反馈标记为已处理状态。')
      fetchFeedbacks() // 重新刷一下列表，让状态标签变绿
    }
  } catch (error) {
    console.error(error)
  }
}

// 3. 核心：响应管理员点击【删除】
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要物理删除这条来自 [${row.username}] 的反馈吗？`, '警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteFeedbackAPI(row.id)
    if (res && res.code === 200) {
      ElMessage.success('该反馈记录已被彻底从数据库中抹去。')
      fetchFeedbacks()
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchFeedbacks()
})
</script>

<style scoped>
.admin-feedback-page { padding: 24px; background: #fff; border-radius: 8px; height: 100%; box-sizing: border-box; }
.header-title h2 { margin: 0 0 8px 0; color: #333; }
.header-title p { margin: 0; color: #999; font-size: 14px; }
</style>