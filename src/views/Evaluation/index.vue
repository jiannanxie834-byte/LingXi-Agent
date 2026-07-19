<template>
  <div class="evaluation-page">
    <section class="submit-panel">
      <div class="panel-header">
        <h2>数据结构与算法学习诊断</h2>
        <el-tag type="success" effect="plain">长期学情</el-tag>
      </div>

      <div class="diagnosis-note">
        掌握度只使用有效作答和认证评价；规划进度、自评与复盘单独展示。没有有效证据时显示“证据不足”，不会按 0 分处理。
      </div>

      <div class="auto-card">
        <div>
          <h3>平台数据自动诊断</h3>
          <p>系统会核验作答完整度、证据来源和时间，再生成可复算的阶段性诊断。</p>
        </div>
        <el-button type="primary" :loading="autoLoading" @click="runAutoEvaluation">
          自动诊断
        </el-button>
      </div>

      <el-collapse v-model="manualPanels" class="manual-collapse">
        <el-collapse-item name="manual">
          <template #title>
            <span class="collapse-title">补充线下错题或特殊卡点</span>
            <el-tag size="small" type="info" effect="plain">可选</el-tag>
          </template>

          <el-form :model="form" label-position="top" class="eval-form">
            <div class="form-grid">
              <el-form-item label="学习主题">
                <el-input v-model="form.topic" placeholder="如：我总是写错二分查找边界" />
              </el-form-item>
              <el-form-item label="掌握自评">
                <div class="slider-line">
                  <el-slider v-model="form.confidence" :min="0" :max="100" />
                  <span>{{ form.confidence }}%</span>
                </div>
              </el-form-item>
            </div>

            <el-form-item label="错题或卡点">
              <el-input
                v-model="form.wrong_notes"
                type="textarea"
                :rows="4"
                placeholder="写下做错的题目、卡住的步骤或不确定的概念"
              />
            </el-form-item>

            <el-form-item label="你的作答思路">
              <el-input
                v-model="form.answer_summary"
                type="textarea"
                :rows="4"
                placeholder="简要描述你原本是怎么理解和作答的"
              />
            </el-form-item>

            <div class="actions">
              <el-button type="primary" :loading="submitting" @click="submitEvaluation">
                按补充说明重新诊断
              </el-button>
              <el-button @click="resetForm">清空</el-button>
            </div>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </section>

    <section v-if="result" class="result-panel">
      <div class="score-block">
        <div class="score" :class="{ 'score-empty': result.score == null }">{{ result.score ?? '—' }}</div>
        <div>
          <h3>{{ result.level }}</h3>
          <p v-if="result.diagnosis_status === 'insufficient_evidence'">
            当前没有足够的有效作答，系统暂不判断掌握水平。完成一组练习后即可形成可信分数。
          </p>
          <p v-else-if="result.diagnosis_status === 'provisional'">
            当前为低置信度暂估结果，继续完成同主题练习后会逐步稳定。
          </p>
          <p v-else>诊断报告已生成，可继续生成面向本知识点的补弱学习包。</p>
          <div v-if="result.auto_summary" class="auto-summary">{{ result.auto_summary }}</div>
          <el-tag v-if="result.is_reused" type="info" effect="plain">证据未变化，复用上次诊断</el-tag>
          <div v-if="publicDataSources.length" class="source-tags">
            <el-tag v-for="item in publicDataSources" :key="item" size="small">{{ item }}</el-tag>
          </div>
          <el-button
            class="package-button"
            type="primary"
            plain
            :loading="packageLoading"
            @click="generatePackage"
          >
            生成补弱学习包
          </el-button>
          <el-button
            v-if="result.recommended_exercise?.route"
            class="package-button"
            type="success"
            @click="goRecommendedExercise"
          >
            {{ result.score == null ? '完成诊断练习，建立可信分数' : '继续练习，提升证据置信度' }}
          </el-button>
        </div>
      </div>

      <div class="diagnosis-metrics">
        <div>
          <span>知识掌握度</span>
          <strong>{{ result.score ?? '待评估' }}</strong>
          <em>只看有效作答</em>
        </div>
        <div>
          <span>证据置信度</span>
          <strong>{{ result.confidence_score ?? 0 }}</strong>
          <em>题量、来源、覆盖和时效</em>
        </div>
        <div>
          <span>当前主题规划</span>
          <strong>{{ result.diagnosis_evidence?.execution_rate ?? '暂无' }}<template v-if="result.diagnosis_evidence?.execution_rate != null">%</template></strong>
          <em>不计入掌握度</em>
        </div>
        <div>
          <span>复盘能力</span>
          <strong>{{ result.reflection_score ?? '未评估' }}</strong>
          <em>仅手动复盘时评价</em>
        </div>
      </div>

      <div class="location-grid">
        <div>
          <span>定位章节</span>
          <strong>{{ result.chapter_title || '待定位' }}</strong>
        </div>
        <div>
          <span>定位小节</span>
          <strong>{{ result.section_title || '待定位' }}</strong>
        </div>
        <div>
          <span>关联知识点</span>
          <strong>{{ safeList(result.unit_titles).join('、') || '待定位' }}</strong>
        </div>
      </div>

      <div v-if="safeList(result.score_breakdown).length || result.diagnosis_evidence" class="evidence-panel">
        <div class="evidence-header">
          <h4>诊断依据</h4>
          <span>仅由有效学习证据计算；每项贡献均可复算</span>
        </div>
        <div v-if="safeList(result.score_breakdown).length" class="breakdown-list">
          <div v-for="item in result.score_breakdown" :key="item.name" class="breakdown-item">
            <span>{{ item.name }}</span>
            <strong>{{ item.value }} 分</strong>
            <em>实际权重 {{ Math.round(Number(item.weight || 0) * 100) }}% · 贡献 {{ item.contribution ?? 0 }} 分</em>
            <small v-if="item.question_count">完成 {{ item.answered_count }}/{{ item.question_count }} 题</small>
            <small v-if="item.created_at">{{ item.created_at }}</small>
          </div>
        </div>
        <div v-if="result.diagnosis_evidence" class="evidence-metrics">
          <el-tag size="small" effect="plain">有效证据：{{ result.diagnosis_evidence.evidence_count ?? 0 }} 条</el-tag>
          <el-tag size="small" effect="plain">有效作答：{{ result.diagnosis_evidence.answered_item_count ?? 0 }} 题</el-tag>
          <el-tag size="small" effect="plain">证据置信度：{{ result.diagnosis_evidence.confidence_score ?? 0 }}</el-tag>
          <el-tag size="small" effect="plain">规划执行：{{ result.diagnosis_evidence.execution_rate ?? '暂无' }}</el-tag>
        </div>
      </div>

      <div class="result-grid">
        <div class="result-box">
          <h4>薄弱点</h4>
          <ul>
            <li v-for="item in result.weak_points" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div class="result-box">
          <h4>补救建议</h4>
          <ol>
            <li v-for="item in result.suggestions" :key="item">{{ item }}</li>
          </ol>
        </div>
      </div>

      <div v-if="generatedPackage.length" class="package-grid">
        <div v-for="item in generatedPackage" :key="item.artifact_id" class="package-card">
          <el-tag size="small">{{ item.type }}</el-tag>
          <h4>{{ item.title }}</h4>
          <p>{{ item.summary }}</p>
        </div>
      </div>
    </section>

    <section class="history-panel">
      <div class="panel-header">
        <h2>学习诊断记录</h2>
        <el-button size="small" plain @click="fetchHistory">刷新</el-button>
      </div>
      <el-table :data="history" style="width: 100%;" empty-text="暂无学习诊断记录">
        <el-table-column prop="created_at" label="时间" width="170" />
        <el-table-column prop="topic" label="主题" min-width="140" />
        <el-table-column prop="chapter_title" label="章节" min-width="170">
          <template #default="{ row }">{{ row.chapter_title || '待定位' }}</template>
        </el-table-column>
        <el-table-column prop="section_title" label="小节" min-width="180">
          <template #default="{ row }">{{ row.section_title || '待定位' }}</template>
        </el-table-column>
        <el-table-column label="掌握度" width="110" align="center">
          <template #default="{ row }">{{ row.score ?? '证据不足' }}</template>
        </el-table-column>
        <el-table-column prop="level" label="等级" width="110" align="center" />
        <el-table-column label="依据" width="130" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="recordRuleType(row)">{{ recordRuleLabel(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="薄弱点" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ safeList(row.weak_points).join('、') }}
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  submitEvaluationAPI,
  autoEvaluationAPI,
  getEvaluationHistoryAPI,
  generateRemediationPackageAPI
} from '@/api/evaluation'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const submitting = ref(false)
const autoLoading = ref(false)
const packageLoading = ref(false)
const result = ref(null)
const history = ref([])
const generatedPackage = ref([])
const manualPanels = ref([])

const defaultForm = () => ({
  topic: '',
  wrong_notes: '',
  answer_summary: '',
  confidence: 60
})

const form = ref(defaultForm())

const fetchHistory = async () => {
  if (!userStore.username) return
  const res = await getEvaluationHistoryAPI(userStore.username)
  if (res?.code === 200) history.value = res.data || []
}

const safeList = (value) => Array.isArray(value) ? value : []

const publicDataSources = computed(() => {
  const labels = safeList(result.value?.data_sources).map((source) => {
    const key = String(source || '').toLowerCase()
    if (key.includes('exercise') || key.includes('练习')) return '练习作答'
    if (key.includes('evaluation') || key.includes('诊断') || key.includes('评价')) return '学习诊断'
    if (key.includes('plan') || key.includes('规划')) return '规划进度'
    if (key.includes('todo') || key.includes('任务')) return '自主任务'
    if (key.includes('reflection') || key.includes('复盘')) return '学习复盘'
    if (key.includes('chat') || key.includes('对话')) return '学习对话'
    if (key.includes('resource') || key.includes('资源')) return '资源使用'
    return '学习记录'
  })
  return [...new Set(labels)]
})

const recordRuleLabel = (row) => {
  if (row?.diagnosis_type?.startsWith('exercise')) return '练习作答'
  if (row?.algorithm_status === 'current') return '综合诊断'
  if (row?.algorithm_status === 'legacy') return '历史诊断'
  return '补充诊断'
}

const recordRuleType = (row) => {
  if (row?.algorithm_status === 'legacy') return 'info'
  if (row?.diagnosis_type?.startsWith('exercise')) return 'success'
  return 'primary'
}

const goRecommendedExercise = () => {
  if (result.value?.recommended_exercise?.route) router.push(result.value.recommended_exercise.route)
}

const submitEvaluation = async () => {
  const hasContent = form.value.topic.trim() || form.value.wrong_notes.trim() || form.value.answer_summary.trim()
  if (!hasContent) return ElMessage.warning('请先填写学习主题或错题描述')

  submitting.value = true
  try {
    const res = await submitEvaluationAPI({
      username: userStore.username || 'student',
      ...form.value
    })
    if (res?.code === 200) {
      result.value = res.data
      generatedPackage.value = []
      if (res.data.profile) userStore.updateLearningProfile(res.data.profile)
      ElMessage.success('诊断完成，学习画像和规划路线已同步更新')
      fetchHistory()
    }
  } finally {
    submitting.value = false
  }
}

const runAutoEvaluation = async () => {
  autoLoading.value = true
  try {
    const res = await autoEvaluationAPI(userStore.username || 'student')
    if (res?.code === 200) {
      result.value = res.data
      generatedPackage.value = []
      if (res.data.profile) userStore.updateLearningProfile(res.data.profile)
      ElMessage.success(res.data.is_reused ? '学习证据未变化，已复用上次诊断' : '已基于有效学习证据完成自动诊断')
      fetchHistory()
    }
  } finally {
    autoLoading.value = false
  }
}

const generatePackage = async () => {
  if (!result.value?.record?.id) return ElMessage.warning('请先完成一次学习诊断')
  packageLoading.value = true
  try {
    const res = await generateRemediationPackageAPI({
      username: userStore.username || 'student',
      record_id: result.value.record.id
    })
    if (res?.code === 200) {
      generatedPackage.value = res.data?.artifacts || []
      ElMessage.success('补弱学习包已生成')
    }
  } finally {
    packageLoading.value = false
  }
}

const resetForm = () => {
  form.value = defaultForm()
  result.value = null
  generatedPackage.value = []
}

onMounted(async () => {
  await fetchHistory()
  if (route.query.refresh === '1') runAutoEvaluation()
})
</script>

<style scoped>
.evaluation-page {
  min-height: 100%;
  padding: 24px;
  box-sizing: border-box;
  background: #f6f8fb;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.submit-panel,
.result-panel,
.history-panel {
  background: #fff;
  border: 1px solid #e8edf3;
  border-radius: 8px;
  padding: 20px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

.diagnosis-note {
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  background: #eef2ff;
  color: #3730a3;
  line-height: 1.65;
}

.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 0.7fr);
  gap: 18px;
}

.auto-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 16px;
  margin-bottom: 18px;
  background: #f5f9ff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
}

.auto-card h3 {
  margin: 0 0 6px;
  font-size: 16px;
  color: #1f2937;
}

.auto-card p {
  margin: 0;
  color: #667085;
  line-height: 1.6;
}

.slider-line {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 52px;
  align-items: center;
  gap: 12px;
}

.slider-line span {
  color: #3b82f6;
  font-weight: 700;
  text-align: right;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.score-block {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 16px;
}

.score {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: #1677ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: 800;
}

.score.score-empty {
  background: #eef2f6;
  color: #667085;
  border: 2px dashed #cbd5e1;
}

.score-block h3 {
  margin: 0 0 6px;
  font-size: 18px;
  color: #111827;
}

.score-block p {
  margin: 0;
  color: #667085;
}

.auto-summary {
  margin-top: 8px;
  color: #475467;
  line-height: 1.6;
}

.source-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.package-button {
  margin-top: 12px;
}

.diagnosis-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.diagnosis-metrics > div {
  display: grid;
  gap: 5px;
  padding: 13px 14px;
  border: 1px solid #e8edf3;
  border-radius: 8px;
  background: #f8fafc;
}

.diagnosis-metrics span,
.diagnosis-metrics em {
  color: #667085;
  font-size: 12px;
  font-style: normal;
}

.diagnosis-metrics strong {
  color: #1d4ed8;
  font-size: 20px;
}

.location-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.location-grid > div {
  background: #f8fafc;
  border: 1px solid #e8edf3;
  border-radius: 8px;
  padding: 12px;
}

.location-grid span {
  display: block;
  margin-bottom: 6px;
  color: #667085;
  font-size: 13px;
}

.location-grid strong {
  color: #1f2937;
  line-height: 1.5;
}

.evidence-panel {
  background: #fbfdff;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  padding: 14px 16px;
  margin-bottom: 16px;
}

.evidence-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.evidence-header h4 {
  margin: 0;
  color: #1f2937;
}

.evidence-header span {
  color: #667085;
  font-size: 13px;
}

.breakdown-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.breakdown-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px 8px;
  padding: 10px;
  background: #fff;
  border: 1px solid #e8edf3;
  border-radius: 8px;
}

.breakdown-item span {
  color: #475467;
}

.breakdown-item strong {
  color: #1677ff;
}

.breakdown-item em {
  grid-column: 1 / -1;
  color: #98a2b3;
  font-size: 12px;
  font-style: normal;
}

.breakdown-item small {
  grid-column: 1 / -1;
  color: #667085;
  font-size: 12px;
}

.evidence-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.manual-collapse {
  border-top: 1px solid #e8edf3;
  border-bottom: 1px solid #e8edf3;
}

.manual-collapse :deep(.el-collapse-item__header) {
  height: 48px;
  font-weight: 700;
  color: #344054;
}

.manual-collapse :deep(.el-collapse-item__content) {
  padding-bottom: 0;
}

.collapse-title {
  margin-right: 8px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.result-box {
  background: #f8fafc;
  border-radius: 8px;
  padding: 14px 16px;
}

.result-box h4 {
  margin: 0 0 10px;
  color: #1f2937;
}

.result-box ul,
.result-box ol {
  margin: 0;
  padding-left: 20px;
  color: #475467;
  line-height: 1.8;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.package-card {
  background: #fff;
  border: 1px solid #e8edf3;
  border-radius: 8px;
  padding: 12px;
}

.package-card h4 {
  margin: 10px 0 6px;
  color: #1f2937;
}

.package-card p {
  margin: 0;
  color: #667085;
  line-height: 1.6;
}

@media (max-width: 760px) {
  .form-grid,
  .result-grid,
  .location-grid,
  .diagnosis-metrics,
  .breakdown-list,
  .package-grid {
    grid-template-columns: 1fr;
  }

  .evaluation-page {
    padding: 16px;
  }

  .auto-card {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
