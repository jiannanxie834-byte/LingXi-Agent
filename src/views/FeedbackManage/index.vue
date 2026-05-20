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
        
<el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">
              查看
            </el-button>
            
            <el-button 
              v-if="scope.row.status === '待处理'" 
              type="success" 
              link 
              @click="handleProcess(scope.row.id)"
            >
              处理
            </el-button>
            
            <el-popconfirm 
              title="确定要永久删除这条反馈吗？" 
              confirm-button-text="删除" 
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="handleDelete(scope.row.id)"
            >
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="反馈详情" width="500px" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="反馈用户">{{ currentFeedback.username }}</el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentFeedback.date }}</el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="currentFeedback.status === '已处理' ? 'success' : 'danger'">
            {{ currentFeedback.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="反馈内容">
          <div style="line-height: 1.6; word-break: break-all;">
            {{ currentFeedback.content }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关 闭</el-button>
          <el-button 
            v-if="currentFeedback.status === '待处理'" 
            type="primary" 
            @click="handleProcess(currentFeedback.id); dialogVisible = false"
          >
            标为已处理
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
//  引入刚打造完工的管理员核心兵器
import { getFeedbackListAPI, processFeedbackAPI, deleteFeedbackAPI } from '@/api/admin'

const feedbackList = ref([])
const loading = ref(false)
// --- 控制弹窗的状态机 ---
const dialogVisible = ref(false)
const currentFeedback = ref({})

//  1. 从后端数据库吞吐真实的反馈列表
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

//  2. 点击按钮，物理轰鸣后端，修改核心库状态
const handleProcess = async (feedbackId) => {
  try {
    const res = await processFeedbackAPI(feedbackId)
    if (res.code === 200) {
      ElMessage.success(res.message)
      // 处理成功后，立刻重新拉取数据
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

// 点击查看，把当前行的数据塞进盒子，并弹窗
const handleView = (row) => {
  currentFeedback.value = { ...row } // 拷贝一份数据
  dialogVisible.value = true
}

// 点击气泡确认删除后触发
const handleDelete = async (feedbackId) => {
  try {
    const res = await deleteFeedbackAPI(feedbackId)
    if (!res || res.code === 200) {
      ElMessage.success('反馈已彻底销毁')
      fetchFeedbackData() // 删除后立刻刷新列表
    }
  } catch (error) {
    console.error('删除异常:', error)
  }
}
</script>

<style scoped>
.table-card { border-radius: 8px; margin: 10px; }
</style>