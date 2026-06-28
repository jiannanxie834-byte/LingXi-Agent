<template>
  <div class="evaluation-page">
    <section class="submit-panel">
      <div class="panel-header">
        <h2>数据结构与算法学习诊断</h2>
        <el-tag type="success" effect="plain">补弱诊断</el-tag>
      </div>

      <div class="auto-card">
        <div>
          <h3>平台数据自动诊断</h3>
          <p>系统会基于学习画像、规划完成状态、历史评价、练习尝试和个性化资源记录生成阶段性诊断。</p>
        </div>
        <el-button type="primary" :loading="autoLoading" @click="runAutoEvaluation">
          自动诊断
        </el-button>
      </div>

      <el-collapse v-model="manualPanels" class="manual-collapse">
        <el-collapse-item name="manual">
          <template #title>
            <span class="collapse-title">补充线下错题 / 特殊卡点</span>
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
        <div class="score">{{ result.score }}</div>
        <div>
          <h3>{{ result.level }}</h3>
          <p>诊断报告已生成，可继续生成面向本知识点的补弱学习包。</p>
          <div v-if="result.auto_summary" class="auto-summary">{{ result.auto_summary }}</div>
          <div v-if="result.data_sources" class="source-tags">
            <el-tag v-for="item in result.data_sources" :key="item" size="small">{{ item }}</el-tag>
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
          <span>由学习行为、作答表现和规划执行综合计算</span>
        </div>
        <div v-if="safeList(result.score_breakdown).length" class="breakdown-list">
          <div v-for="item in result.score_breakdown" :key="item.name" class="breakdown-item">
            <span>{{ item.name }}</span>
            <strong>{{ item.value }} 分</strong>
            <em>权重 {{ Math.round(Number(item.weight || 0) * 100) }}%</em>
          </div>
        </div>
        <div v-if="result.diagnosis_evidence" class="evidence-metrics">
          <el-tag size="small" effect="plain">近期均分：{{ result.diagnosis_evidence.recent_avg_score ?? '暂无' }}</el-tag>
          <el-tag size="small" effect="plain">同主题均分：{{ result.diagnosis_evidence.topic_avg_score ?? '暂无' }}</el-tag>
          <el-tag size="small" effect="plain">练习均分：{{ result.diagnosis_evidence.exercise_avg_score ?? '暂无' }}</el-tag>
          <el-tag size="small" effect="plain">任务完成率：{{ result.diagnosis_evidence.execution_rate ?? '暂无' }}</el-tag>
          <el-tag size="small" effect="plain">证据数：{{ result.diagnosis_evidence.evidence_count ?? 0 }}</el-tag>
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
        <h2>评价记录</h2>
        <el-button size="small" plain @click="fetchHistory">刷新</el-button>
      </div>
      <el-table :data="history" style="width: 100%;" empty-text="暂无评价记录">
        <el-table-column prop="created_at" label="时间" width="170" />
        <el-table-column prop="topic" label="主题" min-width="140" />
        <el-table-column prop="chapter_title" label="章节" min-width="170">
          <template #default="{ row }">{{ row.chapter_title || '待定位' }}</template>
        </el-table-column>
        <el-table-column prop="section_title" label="小节" min-width="180">
          <template #default="{ row }">{{ row.section_title || '待定位' }}</template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="90" align="center" />
        <el-table-column prop="level" label="等级" width="110" align="center" />
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
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  submitEvaluationAPI,
  autoEvaluationAPI,
  getEvaluationHistoryAPI,
  generateRemediationPackageAPI
} from '@/api/evaluation'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
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
      ElMessage.success('已基于平台学习数据完成自动诊断')
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

onMounted(fetchHistory)
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
