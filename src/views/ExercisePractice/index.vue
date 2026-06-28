<template>
  <div class="exercise-practice-page" v-loading="loading">
    <header class="practice-header">
      <button type="button" @click="goBack">返回资源</button>
      <div>
        <span>练习作答</span>
        <h1>{{ artifact?.title || '练习题集' }}</h1>
        <p>{{ artifact?.summary || '完成作答后，系统会调用 AI 批改并生成诊断与补弱报告。' }}</p>
      </div>
    </header>

    <main class="practice-layout">
      <section class="practice-panel">
        <div class="panel-title">
          <span>题目</span>
          <h2>逐题输入你的答案</h2>
        </div>

        <article
          v-for="(question, index) in questions"
          :key="question.question_id"
          class="question-card"
        >
          <div class="question-head">
            <strong>第 {{ index + 1 }} 题</strong>
            <span>{{ question.label }}</span>
          </div>
          <MarkdownRenderer :content="question.question" />
          <textarea
            v-model="question.answer"
            rows="5"
            placeholder="在这里输入你的答案、思路或代码..."
          />
        </article>

        <div v-if="!questions.length" class="empty-state">
          这份题集暂时没有可解析的题目。
        </div>

        <div class="action-row">
          <button
            type="button"
            class="submit-btn"
            :disabled="grading || !questions.length"
            @click="submitAnswers"
          >
            {{ grading ? 'AI 批改中...' : '提交给 AI 批改' }}
          </button>
          <button
            type="button"
            class="answer-btn"
            :disabled="!questions.length"
            @click="showDirectAnswers"
          >
            直接查看答案
          </button>
        </div>
      </section>

      <aside class="practice-panel result-panel">
        <div class="panel-title">
          <span>批改结果</span>
          <h2>标准答案与补弱报告</h2>
        </div>

        <template v-if="gradeResult">
          <div class="score-card">
            <strong>{{ gradeResult.score }}</strong>
            <span>{{ gradeResult.level }}</span>
          </div>

          <section v-if="gradeResult.per_question?.length" class="result-block">
            <h3>逐题反馈</h3>
            <article
              v-for="item in gradeResult.per_question"
              :key="item.question_index"
              class="feedback-card"
            >
              <strong>第 {{ item.question_index }} 题：{{ item.is_correct ? '基本正确' : '需要修正' }}</strong>
              <p>{{ item.feedback }}</p>
            </article>
          </section>

          <section v-if="gradeResult.standard_answers?.length" class="result-block">
            <h3>AI 标准答案</h3>
            <article
              v-for="item in gradeResult.standard_answers"
              :key="item.question_index"
              class="feedback-card"
            >
              <strong>第 {{ item.question_index }} 题</strong>
              <p>{{ item.answer }}</p>
              <p class="muted">{{ item.explanation }}</p>
            </article>
          </section>

          <section v-if="diagnosticReport" class="result-block report-block">
            <h3>诊断与补弱报告</h3>
            <MarkdownRenderer :content="diagnosticReport" />
          </section>
        </template>

        <template v-else-if="directAnswerVisible">
          <section class="result-block">
            <h3>题集参考答案</h3>
            <article
              v-for="item in directAnswers"
              :key="item.question_index"
              class="feedback-card"
            >
              <strong>第 {{ item.question_index }} 题</strong>
              <p>{{ item.answer || '这道题暂未解析到参考答案。' }}</p>
              <p v-if="item.explanation" class="muted">{{ item.explanation }}</p>
            </article>
          </section>
          <div class="answer-note">
            直接查看答案不会记录作答，也不会生成诊断报告；需要诊断时请提交给 AI 批改。
          </div>
        </template>

        <div v-else class="empty-state">
          提交答案后，这里会显示 AI 批改、标准答案和补弱报告；也可以直接查看题集参考答案。
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getResourceArtifactAPI } from '@/api/resource'
import { gradeExerciseAPI } from '@/api/exercise'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const grading = ref(false)
const artifact = ref(null)
const questions = ref([])
const gradeResult = ref(null)
const directAnswerVisible = ref(false)
const directAnswers = ref([])
const diagnosticReport = computed(() => gradeResult.value?.diagnostic_report || '')

const stripAnswerParts = (text = '') => {
  return String(text)
    .replace(/(?:^|\n)#{1,6}\s*(答案|参考答案|解析|答案与解析)[\s\S]*?(?=\n#{1,6}\s*题|\n\d+[.、]\s*题|$)/g, '\n')
    .replace(/(?:答案|参考答案|解析)[:：][\s\S]*?(?=\n(?:\d+[.、]|#{1,6}\s*题)|$)/g, '')
    .trim()
}

const parseQuestions = (content = '') => {
  const source = stripAnswerParts(content)
  const normalized = source.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  const headingParts = normalized.split(/\n(?=#{1,5}\s*(?:第?\s*\d+\s*[题、.]|题目\s*\d+))/g)
  const parts = headingParts.length > 1
    ? headingParts
    : normalized.split(/\n(?=(?:\d+[.、]\s*)?(?:选择题|判断题|简答题|计算题|代码补全题|实验分析题|项目任务题)[:：])/g)

  const cleaned = parts.map(item => item.trim()).filter(item => item.length > 12)
  if (cleaned.length) {
    return cleaned.map((item, index) => ({
      question_id: String(index + 1),
      label: extractQuestionLabel(item) || '练习题',
      question: item,
      answer: ''
    }))
  }

  return [{
    question_id: '1',
    label: '综合题',
    question: normalized,
    answer: ''
  }]
}

const parseDirectAnswers = (content = '') => {
  const normalized = String(content || '').replace(/\r\n/g, '\n').trim()
  if (!normalized) return []
  const parts = normalized.split(/\n(?=#{1,5}\s*(?:第?\s*\d+\s*[题、.]|题目\s*\d+)|(?:\d+[.、]\s*)?(?:选择题|判断题|简答题|计算题|代码补全题|实验分析题|项目任务题)[:：])/g)
  const sourceBlocks = parts.length > 1 ? parts : questions.value.map(item => item.question)
  return sourceBlocks
    .map((block, index) => {
      const text = String(block || '')
      const answerMatch = text.match(/(?:答案|参考答案)[:：]\s*([\s\S]*?)(?=\n\s*(?:解析|答案解析|常见错误|知识点)[:：]|\n#{1,6}\s*(?:解析|答案解析)|$)/)
      const explanationMatch = text.match(/(?:解析|答案解析)[:：]\s*([\s\S]*?)(?=\n\s*(?:常见错误|知识点)[:：]|\n#{1,6}\s*(?:常见错误|知识点)|$)/)
      return {
        question_index: index + 1,
        answer: (answerMatch?.[1] || '').trim(),
        explanation: (explanationMatch?.[1] || '').trim()
      }
    })
    .filter(item => item.answer || item.explanation)
}

const extractQuestionLabel = (text = '') => {
  const firstLine = String(text).split('\n').find(Boolean) || ''
  return firstLine.replace(/^#{1,6}\s*/, '').slice(0, 30)
}

const fetchArtifact = async () => {
  const artifactId = route.params.artifactId
  if (!artifactId) return
  loading.value = true
  try {
    const res = await getResourceArtifactAPI(artifactId)
    if (res?.code === 200) {
      artifact.value = res.data
      questions.value = parseQuestions(res.data?.content || res.data?.summary || '')
      directAnswers.value = parseDirectAnswers(res.data?.content || '')
    }
  } catch (error) {
    console.error('练习题集加载失败:', error)
    ElMessage.error('练习题集加载失败')
  } finally {
    loading.value = false
  }
}

const showDirectAnswers = () => {
  gradeResult.value = null
  directAnswers.value = parseDirectAnswers(artifact.value?.content || '')
  directAnswerVisible.value = true
  if (!directAnswers.value.length) {
    ElMessage.warning('这份题集暂时没有可直接展示的内置答案')
  }
}

const submitAnswers = async () => {
  if (!artifact.value?.artifact_id) return
  const emptyCount = questions.value.filter(item => !String(item.answer || '').trim()).length
  if (emptyCount === questions.value.length) {
    ElMessage.warning('请至少填写一道题的答案')
    return
  }
  grading.value = true
  directAnswerVisible.value = false
  try {
    const res = await gradeExerciseAPI({
      username: userStore.username || 'student',
      artifact_id: artifact.value.artifact_id,
      answers: questions.value.map(item => ({
        question_id: item.question_id,
        question: item.question,
        answer: item.answer
      }))
    })
    const data = res?.data || {}
    if (!data.success) {
      ElMessage.error(data.message || 'AI 批改失败，请稍后再试')
      return
    }
    gradeResult.value = data.grading
    ElMessage.success('AI 批改完成，诊断与补弱报告已生成')
  } catch (error) {
    console.error('AI 批改失败:', error)
  } finally {
    grading.value = false
  }
}

const goBack = () => {
  router.push('/resource')
}

onMounted(fetchArtifact)
</script>

<style scoped>
.exercise-practice-page {
  min-height: 100%;
  padding: 20px;
  background: #f7f8fa;
  box-sizing: border-box;
  overflow-y: auto;
}
.practice-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
}
.practice-header button {
  border: 1px solid #dbe3ef;
  border-radius: 6px;
  padding: 9px 12px;
  background: #fff;
  color: #334155;
  cursor: pointer;
}
.practice-header span,
.panel-title span {
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}
.practice-header h1,
.panel-title h2 {
  margin: 4px 0 8px;
  color: #111827;
  line-height: 1.3;
}
.practice-header p {
  margin: 0;
  color: #4b5563;
}
.practice-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
  gap: 18px;
  align-items: start;
}
.practice-panel {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.question-card,
.feedback-card,
.score-card,
.empty-state {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}
.question-card {
  display: grid;
  gap: 12px;
  padding: 16px;
}
.question-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #4b5563;
}
.question-head strong {
  color: #111827;
}
textarea {
  width: 100%;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  padding: 12px;
  resize: vertical;
  font: inherit;
  line-height: 1.6;
  box-sizing: border-box;
}
.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.submit-btn,
.answer-btn {
  justify-self: start;
  border: 0;
  border-radius: 8px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
}
.submit-btn {
  background: #1677ff;
  color: #fff;
}
.answer-btn {
  border: 1px solid #dbe3ef;
  background: #fff;
  color: #334155;
}
.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
.answer-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.result-panel {
  position: sticky;
  top: 16px;
}
.score-card {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 16px;
  background: #eff6ff;
  border-color: #bfdbfe;
}
.score-card strong {
  font-size: 34px;
  color: #1677ff;
}
.score-card span {
  color: #1e40af;
  font-weight: 700;
}
.result-block {
  display: grid;
  gap: 10px;
}
.result-block h3 {
  margin: 0;
  color: #111827;
}
.feedback-card,
.empty-state {
  padding: 14px;
}
.feedback-card strong {
  color: #111827;
}
.feedback-card p,
.empty-state {
  color: #4b5563;
  line-height: 1.7;
}
.muted {
  color: #6b7280;
}
.report-block {
  border-top: 1px solid #e5e7eb;
  padding-top: 14px;
}
.answer-note {
  padding: 12px 14px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: #fffbeb;
  color: #92400e;
  line-height: 1.6;
}
@media (max-width: 900px) {
  .practice-layout {
    grid-template-columns: 1fr;
  }
  .result-panel {
    position: static;
  }
}
</style>
