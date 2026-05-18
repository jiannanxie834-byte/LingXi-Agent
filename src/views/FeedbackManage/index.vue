<template>
  <div class="feedback-manage">
    <el-card shadow="never" class="table-card">
      <el-table :data="feedbackList" style="width: 100%" border v-loading="loading">
        <el-table-column prop="username" label="反馈学生" width="120" />
        <el-table-column prop="content" label="反馈详情" min-width="240" />
        <el-table-column prop="date" label="提交时间" width="180" />
        
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已处理' ? 'success' : 'danger'" effect="light">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === '待处理'" 
              type="primary" 
              size="small" 
              plain
              @click="handleProcess(scope.row.id)"
            >
              标记已处理
            </el-button>
            <span v-else style="color: #999; font-size: 13px;">➔ 完美的闭环</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
//  引入刚打造完工的管理员核心兵器
import { getFeedbackListAPI, processFeedbackAPI } from '@/api/admin'

const feedbackList = ref([])
const loading = ref(false)

//  1. 核心：从后端数据库吞吐真实的反馈列表
const fetchFeedbackData = async () => {
  loading.value = true
  try {
    const res = await getFeedbackListAPI()
    if (res.code === 200) {
      feedbackList.value = res.data
    }
  } catch (error) {
    console.error('拉取反馈中心数据失败:', error)
  } finally {
    loading.value = false
  }
}

//  2. 核心：点击按钮，物理轰鸣后端，修改核心库状态
const handleProcess = async (feedbackId) => {
  try {
    const res = await processFeedbackAPI(feedbackId)
    if (res.code === 200) {
      ElMessage.success(res.message)
      // 🌟 数据流闭环的关键：处理成功后，立刻重新拉取数据，让视图动态跳变！
      fetchFeedbackData()
    }
  } catch (error) {
    console.error('处理反馈失败:', error)
  }
}

// 开屏即通电
onMounted(() => {
  fetchFeedbackData()
})
</script>

<style scoped>
.table-card { border-radius: 8px; margin: 10px; }
</style>