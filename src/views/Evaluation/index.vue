<template>
  <div class="evaluation-page">
    <section class="submit-panel">
      <div class="panel-header">
        <h2>学习评价 / 错题诊断</h2>
        <el-tag type="success" effect="plain">评价反馈</el-tag>
      </div>

      <div class="auto-card">
        <div>
          <h3>平台数据自动诊断</h3>
          <p>系统会基于学习画像、规划完成状态、历史评价和资源记录生成阶段性诊断。</p>
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
                <el-input v-model="form.topic" placeholder="如：计算机网络三次握手" />
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
          <p>诊断报告已进入资源审核队列，低分主题会同步生成修复路线。</p>
          <div v-if="result.auto_summary" class="auto-summary">{{ result.auto_summary }}</div>
          <div v-if="result.data_sources" class="source-tags">
            <el-tag v-for="item in result.data_sources" :key="item" size="small">{{ item }}</el-tag>
          </div>
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
    </section>

    <section class="history-panel">
      <div class="panel-header">
        <h2>评价记录</h2>
        <el-button size="small" plain @click="fetchHistory">刷新</el-button>
      </div>
      <el-table :data="history" style="width: 100%;" empty-text="暂无评价记录">
        <el-table-column prop="created_at" label="时间" width="170" />
        <el-table-column prop="topic" label="主题" min-width="140" />
        <el-table-column prop="score" label="得分" width="90" align="center" />
        <el-table-column prop="level" label="等级" width="110" align="center" />
        <el-table-column label="薄弱点" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.weak_points.join('、') }}
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { submitEvaluationAPI, autoEvaluationAPI, getEvaluationHistoryAPI } from '@/api/evaluation'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const submitting = ref(false)
const autoLoading = ref(false)
const result = ref(null)
const history = ref([])
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
      if (res.data.profile) userStore.updateLearningProfile(res.data.profile)
      ElMessage.success('已基于平台学习数据完成自动诊断')
      fetchHistory()
    }
  } finally {
    autoLoading.value = false
  }
}

const resetForm = () => {
  form.value = defaultForm()
  result.value = null
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

@media (max-width: 760px) {
  .form-grid,
  .result-grid {
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
