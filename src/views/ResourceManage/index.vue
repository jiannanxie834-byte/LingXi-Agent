<template>
  <div class="admin-review-page" v-loading="loading">
    
    <div ref="resourceSectionRef" class="section-box">
      <h2> 初始课程知识资源审核</h2>
      <div class="quick-review-panel">
        <div>
          <strong>演示快速审核</strong>
          <p>按学生账号通过最近待审核 Artifact，保留教师审核动作，便于演示资源进入学生端资源工厂。</p>
        </div>
        <div class="quick-review-actions">
          <el-input
            v-model="quickReviewUsername"
            placeholder="学生账号，如 student"
            clearable
            style="width: 220px;"
            @keyup.enter="handleApproveLatestResources"
          />
          <el-input-number
            v-model="quickReviewLimit"
            :min="1"
            :max="20"
            controls-position="right"
            style="width: 112px;"
          />
          <el-button
            type="primary"
            :loading="quickReviewLoading"
            @click="handleApproveLatestResources"
          >
            通过最近待审核资源
          </el-button>
        </div>
      </div>
      <el-tabs v-model="activeResourceStatus" class="resource-status-tabs">
        <el-tab-pane
          v-for="tab in resourceStatusTabs"
          :key="tab.name"
          :label="`${tab.label} ${tab.count}`"
          :name="tab.name"
        />
      </el-tabs>
      <el-table :data="currentResourceList" row-key="id" border stripe class="resource-table">
        <el-table-column label="资源信息" min-width="260">
          <template #default="scope">
            <div class="resource-main-cell">
              <button class="resource-title-btn" type="button" @click="openDetail(scope.row)">
                {{ scope.row.title || '未命名资源' }}
              </button>
              <div class="resource-meta-line">
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
        <el-table-column label="申请人" width="120" align="center">
          <template #default="scope">
            {{ scope.row.applicant_username || scope.row.uploader || 'system' }}
          </template>
        </el-table-column>
        <el-table-column label="摘要" min-width="220">
          <template #default="scope">
            <div class="source-cell">
              <div class="source-summary">{{ scope.row.summary || scope.row.source || '暂无摘要' }}</div>
              <div v-if="scope.row.review_comment" class="review-comment-line">
                审核意见：{{ scope.row.review_comment }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="scope">
            <div class="action-group">
              <el-button size="small" plain @click="openDetail(scope.row)">查看</el-button>
              <el-button
                v-if="scope.row.status === '待审核'"
                size="small"
                type="primary"
                @click="handleApproveRes(scope.row)"
              >
                通过
              </el-button>
              <el-button
                v-if="scope.row.status === '待审核' || scope.row.status === '已通过'"
                size="small"
                type="danger"
                plain
                @click="handleRejectRes(scope.row)"
              >
                下架
              </el-button>
              <el-button
                v-if="scope.row.status === '未通过'"
                size="small"
                type="success"
                plain
                @click="handleReopenRes(scope.row)"
              >
                重新上线
              </el-button>
              <el-button
                v-if="scope.row.status === '未通过'"
                size="small"
                type="warning"
                plain
                @click="handleUpdateComment(scope.row)"
              >
                修改意见
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div ref="typeSectionRef" class="section-box" style="margin-top: 40px;">
      <h2> 学生申请自定义新Tab分类审核</h2>
      <el-tabs v-model="activeTypeStatus" class="resource-status-tabs">
        <el-tab-pane
          v-for="tab in typeStatusTabs"
          :key="tab.name"
          :label="`${tab.label} ${tab.count}`"
          :name="tab.name"
        />
      </el-tabs>
      <el-table :data="currentTypeList" row-key="name" border stripe class="type-review-table">
        <el-table-column label="拟申请新分类名称" min-width="220">
          <template #default="scope">
            <div class="type-name">{{ scope.row.name }}</div>
            <div v-if="scope.row.reason" class="type-reason">{{ scope.row.reason }}</div>
            <div v-if="scope.row.review_comment" class="type-review-comment">审核意见：{{ scope.row.review_comment }}</div>
            <div class="type-applicant">申请人：{{ scope.row.applicant_username || 'student' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="审批状态" width="96" align="center">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="scope">
            <div class="action-group">
              <el-button
                v-if="scope.row.status === '待审核'"
                size="small"
                type="primary"
                @click="handleApproveType(scope.row)"
              >
                通过
              </el-button>
              <el-button
                v-if="scope.row.status === '待审核' || scope.row.status === '已通过'"
                size="small"
                type="danger"
                plain
                @click="handleRejectType(scope.row)"
              >
                下架
              </el-button>
              <el-button
                v-if="scope.row.status === '未通过'"
                size="small"
                type="success"
                plain
                @click="handleReopenType(scope.row)"
              >
                重新上线
              </el-button>
              <el-button
                v-if="scope.row.status === '未通过'"
                size="small"
                type="warning"
                plain
                @click="handleUpdateTypeComment(scope.row)"
              >
                修改意见
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailVisible" title="资源审核详情" width="760px" destroy-on-close>
      <div v-if="selectedResource" class="resource-detail">
        <h3>{{ selectedResource.title }}</h3>
        <div class="detail-meta">
          <el-tag>{{ selectedResource.type }}</el-tag>
          <el-tag :type="statusTagType(selectedResource.status)">{{ selectedResource.status }}</el-tag>
          <span>{{ selectedResource.uploader || 'system' }}</span>
          <span>{{ selectedResource.time || '暂无时间' }}</span>
        </div>
        <p class="summary">{{ selectedResource.summary || '暂无摘要' }}</p>
        <div v-if="selectedResource.review_comment" class="detail-review-comment">
          <strong>管理员审核意见</strong>
          <p>{{ selectedResource.review_comment }}</p>
        </div>
        <MarkdownRenderer :content="selectedResource.content || '暂无正文内容'" />
        <el-collapse class="debug-collapse">
          <el-collapse-item title="调试信息（默认收起）" name="debug">
            <pre>{{ debugText(selectedResource) }}</pre>
          </el-collapse-item>
        </el-collapse>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="selectedResource" @click="downloadPptx(selectedResource)">导出PPT</el-button>
        <el-button
          v-if="selectedResource && selectedResource.status === '待审核'"
          type="primary"
          @click="handleApproveRes(selectedResource)"
        >
          审核通过
        </el-button>
        <el-button
          v-if="selectedResource && (selectedResource.status === '待审核' || selectedResource.status === '已通过')"
          type="danger"
          plain
          @click="handleRejectRes(selectedResource)"
        >
          下架
        </el-button>
        <el-button
          v-if="selectedResource && selectedResource.status === '未通过'"
          type="success"
          plain
          @click="handleReopenRes(selectedResource)"
        >
          重新上线
        </el-button>
        <el-button
          v-if="selectedResource && selectedResource.status === '未通过'"
          type="warning"
          plain
          @click="handleUpdateComment(selectedResource)"
        >
          提出修改意见
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAllResourcesAPI,
  approveResourceAPI,
  approveLatestResourcesAPI,
  rejectResourceAPI,
  reopenResourceAPI,
  updateResourceCommentAPI,
  getAllTypesAPI,
  approveTypeAPI,
  rejectTypeAPI,
  reopenTypeAPI,
  updateTypeCommentAPI
} from '@/api/admin'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'

const loading = ref(false)
const route = useRoute()
const resourceList = ref([])
const typeList = ref([])
const activeResourceStatus = ref('pending')
const activeTypeStatus = ref('pending')
const detailVisible = ref(false)
const selectedResource = ref(null)
const resourceSectionRef = ref(null)
const typeSectionRef = ref(null)
const quickReviewUsername = ref('student')
const quickReviewLimit = ref(10)
const quickReviewLoading = ref(false)

const resourceStatusMap = {
  pending: { label: '未处理', status: '待审核' },
  approved: { label: '已通过', status: '已通过' },
  rejected: { label: '未通过', status: '未通过' },
  archived: { label: '已归档', statuses: ['archived_shallow', 'merged_into_chapter_pack', 'legacy_demo_only'] }
}

const typeStatusMap = {
  pending: { label: '未处理', status: '待审核' },
  approved: { label: '已通过', status: '已通过' },
  rejected: { label: '未通过', status: '未通过' }
}

const normalizeStatusTab = (status) => {
  return ['pending', 'approved', 'rejected'].includes(status) ? status : 'pending'
}

const ARCHIVE_STATUSES = ['archived_shallow', 'merged_into_chapter_pack', 'legacy_demo_only']

const statusListOf = (config) => config?.statuses || [config?.status].filter(Boolean)

const resourcesByStatusConfig = (config) => {
  const statuses = statusListOf(config)
  return resourceList.value.filter(item => statuses.includes((item.status || '').trim()))
}

const resourcesByStatus = (status) => {
  return resourceList.value.filter(item => (item.status || '').trim() === status)
}

const resourceStatusTabs = computed(() => {
  return Object.entries(resourceStatusMap).map(([name, config]) => ({
    name,
    label: config.label,
    count: resourcesByStatusConfig(config).length
  }))
})

const currentResourceList = computed(() => {
  const config = resourceStatusMap[activeResourceStatus.value] || resourceStatusMap.pending
  return resourcesByStatusConfig(config)
})

const typesByStatus = (status) => {
  return typeList.value.filter(item => (item.status || '').trim() === status)
}

const typeStatusTabs = computed(() => {
  return Object.entries(typeStatusMap).map(([name, config]) => ({
    name,
    label: config.label,
    count: typesByStatus(config.status).length
  }))
})

const currentTypeList = computed(() => {
  const status = typeStatusMap[activeTypeStatus.value]?.status || '待审核'
  return typesByStatus(status)
})

const debugText = (resource = {}) => {
  const debugInfo = {
    resource_id: resource.id || resource.resource_id || '',
    chapter: resource.chapter_title || resource.chapter_id || '',
    content_length: plainTextLength(resource.content),
    question_count: questionCount(resource.content) || 0,
    safety_review: resource.safety_review || {},
    teaching_quality_review: resource.teaching_quality_review || {},
    evidence_review: resource.evidence_review || {},
    source: resource.source || '',
    agent_notes: resource.agent_notes || '',
    agent_trace_id: resource.agent_trace_id || ''
  }
  return JSON.stringify(debugInfo, null, 2)
}

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

const teachingQualityText = (review) => {
  if (!review || !Number.isFinite(Number(review.score || review.teaching_quality_score))) return '教学质量：未评估'
  const score = Number(review.score || review.teaching_quality_score)
  if (review.passed || review.status === 'passed') return `教学质量：${score}分 · 已通过`
  return score >= 80 ? `教学质量：${score}分 · 待复核` : '教学质量：未达标'
}

const teachingQualityTagType = (review) => {
  if (!review || !Number.isFinite(Number(review.score || review.teaching_quality_score))) return 'info'
  const score = Number(review.score || review.teaching_quality_score)
  if (review.passed || review.status === 'passed' || score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}

const teachingQualityClass = (review) => {
  const type = teachingQualityTagType(review)
  if (type === 'success') return 'risk-low'
  if (type === 'warning') return 'risk-medium'
  if (type === 'danger') return 'risk-high'
  return 'risk-unknown'
}

const plainTextLength = (value) => String(value || '').replace(/\s+/g, '').length

const questionCount = (value) => {
  const matches = String(value || '').match(/(^|\n)###\s*题目\s*\d+/g)
  return matches ? matches.length : 0
}

const isArchivedStatus = (status) => ARCHIVE_STATUSES.includes((status || '').trim())

const archiveStatusText = (status) => {
  const map = {
    archived_shallow: '已归档：浅资源',
    merged_into_chapter_pack: '已合并进章节学习包',
    legacy_demo_only: '旧版演示资源，仅管理员追溯'
  }
  return map[status] || '已归档'
}

const chapterLabel = (resource = {}) => {
  if (resource.chapter_title) return resource.chapter_title
  if (resource.chapter_id) return resource.chapter_id
  return '未绑定章节'
}

const isStudentVisible = (resource = {}) => {
  return resource.status === '已通过' && resource.student_visible !== false && !isArchivedStatus(resource.status)
}

const isLowQuality = (resource = {}) => {
  const review = resource.teaching_quality_review || {}
  const score = Number(review.score || review.teaching_quality_score || 0)
  if (review.status === 'failed' || review.fatal) return true
  if (score > 0 && score < 80) return true
  if (resource.type === '课程讲解文档' && plainTextLength(resource.content) < 3000) return true
  if (resource.type === '练习题集' && questionCount(resource.content) < 8) return true
  return plainTextLength(resource.content) < 1200 && !['知识点思维导图', '算法可视化动画规格', '交互动画规格', '动画分镜'].includes(resource.type)
}

const shouldWarnTeachingQuality = (resource) => {
  const review = resource?.teaching_quality_review || {}
  const score = Number(review.score || review.teaching_quality_score || 0)
  return plainTextLength(resource?.content) < 1200 || (score > 0 && score < 80) || review.status === 'failed'
}

const statusTagType = (status) => {
  if (status === '已通过') return 'success'
  if (status === '未通过') return 'danger'
  if (isArchivedStatus(status)) return 'info'
  return 'warning'
}

const isDeprecatedStandaloneType = () => false

const askReviewComment = async ({ title, message, defaultValue = '' }) => {
  try {
    const { value } = await ElMessageBox.prompt(message, title, {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputValue: defaultValue,
      inputPlaceholder: '请输入要发送给学生的审核意见',
      inputValidator: (value) => {
        if (!value || !value.trim()) return '请填写审核意见'
        if (value.trim().length > 200) return '审核意见不要超过 200 字'
        return true
      }
    })
    return value.trim()
  } catch (error) {
    return null
  }
}

// 拉取活数据
const loadAllReviewData = async () => {
  loading.value = true
  try {
    const resRes = await getAllResourcesAPI()
    if (resRes && resRes.code === 200) {
      resourceList.value = resRes.data.map(item => ({ ...item }))
    }

    const typeRes = await getAllTypesAPI()
    if (typeRes && typeRes.code === 200) {
      typeList.value = typeRes.data.map(item => ({ ...item }))
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const scrollToSection = async (section) => {
  await nextTick()
  const target = section === 'types' ? typeSectionRef.value : resourceSectionRef.value
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const applyRouteFocus = () => {
  const section = route.query.section
  const status = normalizeStatusTab(route.query.status)
  if (section === 'types') {
    activeTypeStatus.value = status
    scrollToSection('types')
    return
  }
  if (section === 'resources') {
    activeResourceStatus.value = status
    scrollToSection('resources')
  }
}

const handleApproveLatestResources = async () => {
  const username = quickReviewUsername.value.trim()
  if (!username) {
    ElMessage.warning('请填写学生账号')
    return
  }

  quickReviewLoading.value = true
  try {
    const res = await approveLatestResourcesAPI({
      username,
      limit: quickReviewLimit.value || 10
    })
    if (res && res.code === 200) {
      const count = res.data?.count ?? 0
      ElMessage.success(`已通过该学生最近生成的 ${count} 份资源`)
      await loadAllReviewData()
      activeResourceStatus.value = count > 0 ? 'approved' : activeResourceStatus.value
    } else {
      ElMessage.error(res?.message || '快速审核失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('快速审核失败')
  } finally {
    quickReviewLoading.value = false
  }
}

// 资源通过
const handleApproveRes = async (row) => {
  const res = await approveResourceAPI(row.id)
  if (res && res.code === 200) {
    row.status = '已通过'
    if (selectedResource.value && selectedResource.value.id === row.id) selectedResource.value.status = '已通过'
    ElMessage.success(res.message)
  }
}

// 资源下架
const handleRejectRes = async (row) => {
  const comment = await askReviewComment({
    title: row.status === '已通过' ? '确认下架资源' : '确认资源不予通过',
    message: row.status === '已通过'
      ? `请填写资源「${row.title}」的下架原因，学生端会收到这条系统消息。`
      : `请填写资源「${row.title}」未通过的修改意见，学生端会收到这条系统消息。`,
    defaultValue: row.review_comment || ''
  })
  if (comment === null) return

  const res = await rejectResourceAPI(row.id, comment)
  if (res && res.code === 200) {
    row.status = '未通过'
    row.review_comment = comment
    if (selectedResource.value && selectedResource.value.id === row.id) {
      selectedResource.value.status = '未通过'
      selectedResource.value.review_comment = comment
    }
    ElMessage.success(res.message)
  }
}

const handleReopenRes = async (row) => {
  const res = await reopenResourceAPI(row.id)
  if (res && res.code === 200) {
    row.status = '已通过'
    if (selectedResource.value && selectedResource.value.id === row.id) selectedResource.value.status = '已通过'
    ElMessage.success(res.message)
  }
}

const handleUpdateComment = async (row) => {
  const comment = await askReviewComment({
    title: '提出修改意见',
    message: `请填写资源「${row.title}」的修改意见，学生端会收到这条系统消息。`,
    defaultValue: row.review_comment || ''
  })
  if (comment === null) return

  const res = await updateResourceCommentAPI(row.id, comment)
  if (res && res.code === 200) {
    row.status = '未通过'
    row.review_comment = comment
    if (selectedResource.value && selectedResource.value.id === row.id) {
      selectedResource.value.status = '未通过'
      selectedResource.value.review_comment = comment
    }
    ElMessage.success(res.message)
  }
}

// 分类通过
const handleApproveType = async (row) => {
  const res = await approveTypeAPI(row.name)
  if (res && res.code === 200) {
    row.status = '已通过'
    ElMessage.success(res.message)
  }
}

const handleRejectType = async (row) => {
  const comment = await askReviewComment({
    title: row.status === '已通过' ? '确认下架分类' : '确认分类不予通过',
    message: row.status === '已通过'
      ? `请填写分类「${row.name}」的下架原因，学生端会收到这条系统消息。`
      : `请填写分类「${row.name}」未通过的修改意见，学生端会收到这条系统消息。`,
    defaultValue: row.review_comment || ''
  })
  if (comment === null) return

  const res = await rejectTypeAPI(row.name, comment)
  if (res && res.code === 200) {
    row.status = '未通过'
    row.review_comment = comment
    ElMessage.success(res.message)
  }
}

const handleReopenType = async (row) => {
  const res = await reopenTypeAPI(row.name)
  if (res && res.code === 200) {
    row.status = '已通过'
    ElMessage.success(res.message)
  }
}

const handleUpdateTypeComment = async (row) => {
  const comment = await askReviewComment({
    title: '提出分类修改意见',
    message: `请填写分类「${row.name}」的修改意见，学生端会收到这条系统消息。`,
    defaultValue: row.review_comment || ''
  })
  if (comment === null) return

  const res = await updateTypeCommentAPI(row.name, comment)
  if (res && res.code === 200) {
    row.status = '未通过'
    row.review_comment = comment
    ElMessage.success(res.message)
  }
}

const openDetail = (row) => {
  selectedResource.value = row
  detailVisible.value = true
}

const downloadPptx = (item) => {
  if (!item?.id) return
  window.open(`/api/resource/export/pptx/${encodeURIComponent(item.id)}`, '_blank')
}

watch(
  () => route.query,
  () => applyRouteFocus()
)

onMounted(async () => {
  await loadAllReviewData()
  applyRouteFocus()
})
</script>

<style scoped>
.admin-review-page { padding: 24px; background: #fff; border-radius: 8px; }
.quick-review-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding: 12px 14px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #f8fbff;
}
.quick-review-panel strong {
  display: block;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.5;
}
.quick-review-panel p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}
.quick-review-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.resource-table,
.type-review-table {
  width: 100%;
  margin-top: 15px;
}
.resource-status-tabs {
  margin-top: 16px;
}
.resource-status-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}
.resource-status-tabs :deep(.el-tabs__item) {
  font-weight: 600;
}
.governance-filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.governance-filter-bar button {
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #fff;
  color: #4b5563;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 12px;
  line-height: 1.4;
}
.governance-filter-bar button.active {
  border-color: #1677ff;
  background: #eff6ff;
  color: #1677ff;
  font-weight: 700;
}
.section-box h2 { margin: 0; font-size: 18px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
.resource-main-cell,
.source-cell {
  min-width: 0;
}
.governance-cell {
  min-width: 0;
}
.chapter-line {
  color: #1f2937;
  font-weight: 700;
  line-height: 1.45;
  word-break: break-word;
}
.governance-chip-line {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}
.governance-chip {
  display: inline-flex;
  border-radius: 999px;
  background: #f3f4f6;
  color: #4b5563;
  padding: 3px 7px;
  font-size: 12px;
  line-height: 1.35;
}
.governance-chip.strong {
  background: #ecfdf5;
  color: #047857;
}
.governance-chip.muted {
  background: #f8fafc;
  color: #94a3b8;
}
.archive-line {
  margin-top: 7px;
  color: #475569;
  font-size: 12px;
  line-height: 1.45;
}
.archive-line.warning {
  color: #b45309;
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
.review-comment-line {
  display: -webkit-box;
  margin-top: 7px;
  color: #b45309;
  font-size: 12px;
  line-height: 1.45;
  word-break: break-word;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
.risk-unknown {
  background: #f3f4f6;
  color: #4b5563;
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
.type-reason,
.type-review-comment,
.type-applicant {
  margin-top: 4px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.45;
  word-break: break-word;
}
.type-applicant {
  color: #8c8c8c;
}
.type-review-comment {
  color: #b45309;
}
.deprecated-resource-line {
  margin-top: 6px;
  color: #b45309;
  font-size: 12px;
  line-height: 1.45;
}
.deprecated-resource-panel {
  margin: 12px 0;
  padding: 10px 12px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: #fffbeb;
  color: #92400e;
  line-height: 1.7;
}
.quality-warning-panel {
  margin: 12px 0;
  padding: 10px 12px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
  color: #b91c1c;
  font-weight: 700;
  line-height: 1.7;
}
.resource-detail h3 { margin: 0 0 12px; color: #1f2937; }
.detail-meta { display: flex; align-items: center; gap: 10px; color: #6b7280; margin-bottom: 14px; }
.summary { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; color: #374151; line-height: 1.7; }
.governance-detail-panel {
  margin: 12px 0;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}
.governance-detail-panel strong {
  display: block;
  margin-bottom: 8px;
  color: #1f2937;
}
.governance-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.45;
}
.detail-review-comment {
  margin: 12px 0;
  padding: 12px;
  border-radius: 8px;
  background: #fffbeb;
  border: 1px solid #fde68a;
}
.detail-review-comment strong {
  display: block;
  margin-bottom: 6px;
  color: #92400e;
  font-size: 13px;
}
.detail-review-comment p {
  margin: 0;
  color: #78350f;
  line-height: 1.65;
  word-break: break-word;
}
.source-line { margin: 12px 0; color: #4b5563; font-size: 14px; }
.safety-panel {
  margin: 14px 0;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}
.teaching-quality-panel {
  margin: 14px 0;
  padding: 12px;
  border-radius: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}
.quality-unreviewed {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
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
