<template>
  <div class="admin-review-page" v-loading="loading">
    
    <div class="section-box">
      <h2> 初始课程知识资源审核</h2>
      <el-table :key="resourceTableKey" :data="resourceList" border stripe class="resource-table">
        <el-table-column prop="id" label="资源编码" width="112" align="center" />
        <el-table-column prop="title" label="资源名称" min-width="170" show-overflow-tooltip />
        <el-table-column prop="type" label="资源模态" width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            <el-tag effect="plain">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uploader" label="生成/提交来源" width="130" align="center" show-overflow-tooltip />
        <el-table-column prop="time" label="提交时间" width="138" align="center" />
        <el-table-column label="审核状态" width="96" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已通过' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作放行" width="178" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" plain @click="openDetail(scope.row)">查看</el-button>
            <el-button size="small" type="primary" :disabled="scope.row.status === '已通过'" @click="handleApproveRes(scope.row)">通过</el-button>
            <el-button size="small" type="danger" @click="handleRejectRes(scope.row)">下架</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="section-box" style="margin-top: 40px;">
      <h2> 学生申请自定义新Tab分类审核</h2>
      <el-table :key="typeTableKey" :data="typeList" border stripe style="width: 100%; margin-top: 15px;">
        <el-table-column prop="name" label="拟申请新分类名称" min-width="250" />
        <el-table-column label="当前审批状态" width="180" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已通过' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="批准决策" width="180" align="center">
          <template #default="scope">
            <el-button size="small" type="warning" :disabled="scope.row.status === '已通过'" @click="handleApproveType(scope.row)">
              批准全站动态新增
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailVisible" title="资源审核详情" width="760px" destroy-on-close>
      <div v-if="selectedResource" class="resource-detail">
        <h3>{{ selectedResource.title }}</h3>
        <div class="detail-meta">
          <el-tag>{{ selectedResource.type }}</el-tag>
          <el-tag :type="selectedResource.status === '已通过' ? 'success' : 'warning'">{{ selectedResource.status }}</el-tag>
          <span>{{ selectedResource.uploader || 'system' }}</span>
          <span>{{ selectedResource.time || '暂无时间' }}</span>
        </div>
        <p class="summary">{{ selectedResource.summary || '暂无摘要' }}</p>
        <div class="source-line">知识来源：{{ selectedResource.source || '未标注' }}</div>
        <div class="agent-notes">{{ selectedResource.agent_notes || '暂无智能体说明' }}</div>
        <MarkdownRenderer :content="selectedResource.content || '暂无正文内容'" />
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="selectedResource && selectedResource.status !== '已通过'"
          type="primary"
          @click="handleApproveRes(selectedResource)"
        >
          审核通过
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllResourcesAPI, approveResourceAPI, rejectResourceAPI, getAllTypesAPI, approveTypeAPI } from '@/api/admin'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'

const loading = ref(false)
const resourceList = ref([])
const typeList = ref([])
const resourceTableKey = ref(0)
const typeTableKey = ref(0)
const detailVisible = ref(false)
const selectedResource = ref(null)

// 拉取活数据
const loadAllReviewData = async () => {
  loading.value = true
  try {
    const resRes = await getAllResourcesAPI()
    if (resRes && resRes.code === 200) {
      resourceList.value = resRes.data.map(item => ({ ...item }))
      resourceTableKey.value += 1
    }

    const typeRes = await getAllTypesAPI()
    if (typeRes && typeRes.code === 200) {
      typeList.value = typeRes.data.map(item => ({ ...item }))
      typeTableKey.value += 1
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 资源通过
const handleApproveRes = async (row) => {
  const res = await approveResourceAPI(row.id)
  if (res && res.code === 200) {
    row.status = '已通过'
    if (selectedResource.value && selectedResource.value.id === row.id) selectedResource.value.status = '已通过'
    ElMessage.success(res.message)
    await loadAllReviewData()
  }
}

// 资源下架
const handleRejectRes = async (row) => {
  const res = await rejectResourceAPI(row.id)
  if (res && res.code === 200) {
    resourceList.value = resourceList.value.filter(item => item.id !== row.id)
    resourceTableKey.value += 1
    ElMessage.success(res.message)
    await loadAllReviewData()
  }
}

// 分类通过
const handleApproveType = async (row) => {
  const res = await approveTypeAPI(row.name)
  if (res && res.code === 200) {
    row.status = '已通过'
    ElMessage.success(res.message)
    await loadAllReviewData()
  }
}

const openDetail = (row) => {
  selectedResource.value = row
  detailVisible.value = true
}

onMounted(() => { loadAllReviewData() })
</script>

<style scoped>
.admin-review-page { padding: 24px; background: #fff; border-radius: 8px; }
.resource-table { width: 100%; margin-top: 15px; }
.section-box h2 { margin: 0; font-size: 18px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.resource-detail h3 { margin: 0 0 12px; color: #1f2937; }
.detail-meta { display: flex; align-items: center; gap: 10px; color: #6b7280; margin-bottom: 14px; }
.summary { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; color: #374151; line-height: 1.7; }
.source-line { margin: 12px 0; color: #4b5563; font-size: 14px; }
.agent-notes { margin: 12px 0 18px; padding: 10px 12px; border-left: 4px solid #409eff; background: #ecf5ff; color: #1f4e79; line-height: 1.6; }
:deep(.resource-table .el-button + .el-button) { margin-left: 6px; }
</style>
