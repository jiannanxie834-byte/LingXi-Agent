<template>
  <div class="admin-feedback-page" v-loading="loading">
    <div class="header-title">
      <h2> 学生问题反馈中心</h2>
      <p>实时查看并处理学生在前台提交的系统报错、改进建议与 AI 生成异常通知</p>
    </div>

    <el-table :key="feedbackTableKey" :data="feedbackList" border stripe class="feedback-table">
      <el-table-column label="反馈来源" width="190">
        <template #default="scope">
          <div class="feedback-source">
            <div class="feedback-user">{{ scope.row.username || '匿名学生' }}</div>
            <div class="feedback-id">{{ scope.row.id }}</div>
            <div class="feedback-date">{{ scope.row.date || '暂无时间' }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="反馈具体内容" min-width="320">
        <template #default="scope">
          <div class="feedback-content">
            {{ scope.row.content || '暂无反馈内容' }}
          </div>
        </template>
      </el-table-column>
      
      <el-table-column label="状态" width="92" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === '已处理' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="128" align="center">
        <template #default="scope">
          <div class="feedback-actions">
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
              plain
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 反馈管理接口
import { getAllFeedbackAPI, processFeedbackAPI, deleteFeedbackAPI } from '@/api/admin'

const loading = ref(false)
const feedbackList = ref([])
const feedbackTableKey = ref(0)

// 加载用户反馈
const fetchFeedbacks = async () => {
  loading.value = true
  try {
    const res = await getAllFeedbackAPI()
    if (res && res.code === 200) {
      feedbackList.value = res.data.map(item => ({ ...item }))
      feedbackTableKey.value += 1
    }
  } catch (error) {
    console.error('拉取反馈数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理反馈
const handleProcess = async (row) => {
  try {
    const res = await processFeedbackAPI(row.id)
    if (res && res.code === 200) {
      row.status = '已处理'
      ElMessage.success('归档成功！已将该反馈标记为已处理状态。')
      await fetchFeedbacks() // 重新刷一下列表，让状态标签变绿
    }
  } catch (error) {
    console.error(error)
  }
}

// 删除反馈
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除这条来自 [${row.username}] 的反馈吗？`, '提示', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteFeedbackAPI(row.id)
    if (res && res.code === 200) {
      feedbackList.value = feedbackList.value.filter(item => item.id !== row.id)
      feedbackTableKey.value += 1
      ElMessage.success('该反馈记录已删除。')
      await fetchFeedbacks()
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
.feedback-table {
  width: 100%;
  margin-top: 20px;
}
.feedback-source {
  min-width: 0;
  line-height: 1.45;
}
.feedback-user {
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  word-break: break-word;
}
.feedback-id,
.feedback-date {
  color: #8c8c8c;
  font-size: 12px;
  margin-top: 4px;
  word-break: break-word;
}
.feedback-content {
  color: #374151;
  line-height: 1.7;
  white-space: normal;
  word-break: break-word;
}
.feedback-actions {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}
.feedback-actions :deep(.el-button) {
  margin-left: 0;
}
:deep(.feedback-table .el-table__cell) {
  vertical-align: top;
}
</style>
