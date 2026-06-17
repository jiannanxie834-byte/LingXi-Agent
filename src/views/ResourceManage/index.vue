<template>
  <div class="admin-review-page" v-loading="loading">
    
    <div class="section-box">
      <h2> 初始课程知识资源审核</h2>
      <el-table :key="resourceTableKey" :data="resourceList" border stripe class="resource-table">
        <el-table-column label="资源信息" min-width="260">
          <template #default="scope">
            <div class="resource-main-cell">
              <button class="resource-title-btn" type="button" @click="openDetail(scope.row)">
                {{ scope.row.title || '未命名资源' }}
              </button>
              <div class="resource-meta-line">
                <span>{{ scope.row.id }}</span>
                <span>{{ scope.row.time || '暂无时间' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="资源类型" width="132" align="center">
          <template #default="scope">
            <el-tag effect="plain" class="type-tag">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="来源与摘要" min-width="220">
          <template #default="scope">
            <div class="source-cell">
              <div class="source-name">{{ scope.row.uploader || 'system' }}</div>
              <div class="source-summary">{{ scope.row.summary || scope.row.source || '暂无摘要' }}</div>
              <div v-if="scope.row.safety_review && scope.row.safety_review.risk_level" class="review-chip-line">
                <span class="review-chip" :class="riskClass(scope.row.safety_review.risk_level)">
                  内容自检 {{ scope.row.safety_review.risk_level }} · {{ scope.row.safety_review.score }}分
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已通过' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="scope">
            <div class="action-group">
              <el-button size="small" plain @click="openDetail(scope.row)">查看</el-button>
              <el-button size="small" type="primary" :disabled="scope.row.status === '已通过'" @click="handleApproveRes(scope.row)">通过</el-button>
              <el-button size="small" type="danger" plain @click="handleRejectRes(scope.row)">下架</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="section-box" style="margin-top: 40px;">
      <h2> 学生申请自定义新Tab分类审核</h2>
      <el-table :key="typeTableKey" :data="typeList" border stripe class="type-review-table">
        <el-table-column label="拟申请新分类名称" min-width="220">
          <template #default="scope">
            <div class="type-name">{{ scope.row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="审批状态" width="96" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已通过' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="128" align="center">
          <template #default="scope">
            <el-button size="small" type="warning" plain :disabled="scope.row.status === '已通过'" @click="handleApproveType(scope.row)">
              批准
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
        <div v-if="selectedResource.safety_review && selectedResource.safety_review.risk_level" class="safety-panel">
          <div class="safety-head">
            <span>内容安全与防幻觉自检</span>
            <el-tag :type="riskTagType(selectedResource.safety_review.risk_level)">
              {{ selectedResource.safety_review.risk_level }} · {{ selectedResource.safety_review.score }}分
            </el-tag>
          </div>
          <div class="safety-grid">
            <div>
              <strong>自检项</strong>
              <p v-for="item in selectedResource.safety_review.checks || []" :key="item">{{ item }}</p>
            </div>
            <div>
              <strong>审核建议</strong>
              <p v-for="item in selectedResource.safety_review.suggestions || []" :key="item">{{ item }}</p>
            </div>
          </div>
        </div>
        <div class="agent-notes">{{ selectedResource.agent_notes || '暂无智能体说明' }}</div>
        <MarkdownRenderer :content="selectedResource.content || '暂无正文内容'" />
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="selectedResource" @click="downloadPptx(selectedResource)">导出PPT</el-button>
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

const riskTagType = (riskLevel) => {
  if (riskLevel === '高风险') return 'danger'
  if (riskLevel === '中风险') return 'warning'
  return 'success'
}

const riskClass = (riskLevel) => {
  if (riskLevel === '高风险') return 'risk-high'
  if (riskLevel === '中风险') return 'risk-medium'
  return 'risk-low'
}

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

const downloadPptx = (item) => {
  if (!item?.id) return
  window.open(`http://127.0.0.1:8000/api/resource/export/pptx/${encodeURIComponent(item.id)}`, '_blank')
}

onMounted(() => { loadAllReviewData() })
</script>

<style scoped>
.admin-review-page { padding: 24px; background: #fff; border-radius: 8px; }
.resource-table,
.type-review-table {
  width: 100%;
  margin-top: 15px;
}
.section-box h2 { margin: 0; font-size: 18px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.resource-main-cell,
.source-cell {
  min-width: 0;
}
.resource-title-btn {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.45;
  text-align: left;
  cursor: pointer;
  white-space: normal;
  word-break: break-word;
}
.resource-title-btn:hover {
  color: #1677ff;
}
.resource-meta-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 6px;
  color: #8c8c8c;
  font-size: 12px;
  line-height: 1.4;
}
.type-tag {
  max-width: 112px;
  white-space: normal;
  line-height: 1.35;
  height: auto;
  padding: 4px 8px;
}
.source-name {
  color: #4b5563;
  font-weight: 600;
  font-size: 13px;
  line-height: 1.5;
}
.source-summary {
  display: -webkit-box;
  margin-top: 4px;
  color: #8c8c8c;
  font-size: 12px;
  line-height: 1.45;
  word-break: break-word;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.review-chip-line {
  margin-top: 8px;
}
.review-chip {
  display: inline-flex;
  max-width: 100%;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.35;
  white-space: normal;
}
.risk-low {
  background: #f0fdf4;
  color: #166534;
}
.risk-medium {
  background: #fffbeb;
  color: #92400e;
}
.risk-high {
  background: #fef2f2;
  color: #b91c1c;
}
.action-group {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}
.action-group :deep(.el-button) {
  margin-left: 0;
}
.type-name {
  color: #1f2937;
  font-weight: 600;
  line-height: 1.5;
  white-space: normal;
  word-break: break-word;
}
.resource-detail h3 { margin: 0 0 12px; color: #1f2937; }
.detail-meta { display: flex; align-items: center; gap: 10px; color: #6b7280; margin-bottom: 14px; }
.summary { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; color: #374151; line-height: 1.7; }
.source-line { margin: 12px 0; color: #4b5563; font-size: 14px; }
.safety-panel {
  margin: 14px 0;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}
.safety-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
  color: #1f2937;
  font-weight: 700;
}
.safety-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.safety-grid strong {
  display: block;
  margin-bottom: 6px;
  color: #374151;
  font-size: 13px;
}
.safety-grid p {
  margin: 0 0 5px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.45;
}
.agent-notes { margin: 12px 0 18px; padding: 10px 12px; border-left: 4px solid #409eff; background: #ecf5ff; color: #1f4e79; line-height: 1.6; }
:deep(.resource-table .el-table__cell),
:deep(.type-review-table .el-table__cell) {
  vertical-align: top;
}
</style>
