<template>
  <div class="exercise-practice-page" v-loading="loading">
    <header class="practice-header">
      <button type="button" @click="goBack">返回资源</button>
      <div>
        <span>结构化练习</span>
        <h1>{{ artifact?.title || '练习题集' }}</h1>
        <p>{{ artifact?.summary || '完成作答后，系统会逐题批改并更新学习画像。' }}</p>
      </div>
    </header>

    <div class="practice-steps" aria-label="作答流程">
      <span :class="{ active: !gradeResult }">1 独立作答</span>
      <i>→</i>
      <span :class="{ active: grading }">2 系统批改</span>
      <i>→</i>
      <span :class="{ active: gradeResult }">3 错题复盘</span>
    </div>

    <div v-if="answersViewed" class="viewed-warning">
      你已查看过本题集答案。仍可提交批改，但本次成绩不会写入学生画像。
    </div>

    <main class="practice-layout">
      <section class="practice-panel">
        <div class="panel-title">
          <span>题目</span>
          <h2>{{ questions.length ? `共 ${questions.length} 题，满分 100 分` : '题目加载中' }}</h2>
        </div>

        <article
          v-for="question in questions"
          :key="question.question_id"
          class="question-card"
          :class="resultClass(question.question_id)"
        >
          <div class="question-head">
            <div>
              <strong>第 {{ question.question_index }} 题</strong>
              <span>{{ question.label }}</span>
            </div>
            <em>{{ question.points }} 分</em>
          </div>
          <div v-if="question.knowledge_point" class="knowledge-tag">
            知识点：{{ question.knowledge_point }}
          </div>
          <MarkdownRenderer :content="question.stem" />

          <div v-if="question.type === 'single_choice'" class="option-list">
            <label v-for="option in question.options" :key="option.key" class="option-item">
              <input v-model="question.answer" type="radio" :name="question.question_id" :value="option.key">
              <b>{{ option.key }}</b>
              <span>{{ option.text }}</span>
            </label>
          </div>

          <div v-else-if="question.type === 'true_false'" class="option-list boolean-list">
            <label class="option-item">
              <input v-model="question.answer" type="radio" :name="question.question_id" value="对">
              <span>正确</span>
            </label>
            <label class="option-item">
              <input v-model="question.answer" type="radio" :name="question.question_id" value="错">
              <span>错误</span>
            </label>
          </div>

          <textarea
            v-else
            v-model="question.answer"
            :class="{ 'code-answer': question.type === 'code' }"
            :rows="question.type === 'code' ? 10 : 5"
            :placeholder="answerPlaceholder(question)"
          />

          <div v-if="resultFor(question.question_id)" class="inline-feedback">
            <strong>{{ statusLabel(resultFor(question.question_id).status) }}</strong>
            <span>{{ resultFor(question.question_id).score }} / {{ resultFor(question.question_id).max_score }} 分</span>
            <p>{{ resultFor(question.question_id).feedback }}</p>
            <details>
              <summary>查看参考答案与解析</summary>
              <p><b>参考答案：</b>{{ resultFor(question.question_id).reference_answer || '暂无' }}</p>
              <p><b>解析：</b>{{ resultFor(question.question_id).explanation || '暂无' }}</p>
            </details>
          </div>
        </article>

        <div v-if="!questions.length && !loading" class="empty-state">
          这份题集没有可作答的结构化题目，请更换题集。
        </div>

        <div class="action-row">
          <button
            type="button"
            class="submit-btn"
            :disabled="grading || !questions.length"
            @click="submitAnswers"
          >
            {{ grading ? '讯飞星火批改中...' : (gradeResult ? '重新提交批改' : '提交批改') }}
          </button>
          <button
            type="button"
            class="answer-btn"
            :disabled="!questions.length || grading"
            @click="showDirectAnswers"
          >
            查看参考答案
          </button>
        </div>
      </section>

      <aside class="practice-panel result-panel">
        <div class="panel-title">
          <span>学习反馈</span>
          <h2>本次得分与长期掌握度</h2>
        </div>

        <template v-if="gradeResult">
          <div class="score-grid">
            <div class="score-card">
              <small>本次作答</small>
              <strong>{{ gradeResult.attempt_score }}</strong>
              <span>{{ gradeResult.level }}</span>
            </div>
            <div class="score-card mastery-card">
              <small>长期掌握度</small>
              <strong>{{ gradeResult.mastery_score }}</strong>
              <span>{{ gradeResult.mastery_level }}</span>
            </div>
          </div>

          <div class="profile-state" :class="{ muted: !gradeResult.profile_updated }">
            {{ gradeResult.profile_updated
              ? '已将本次错题和得分写入学生画像'
              : '本次不写入学生画像（作答前已查看答案）' }}
          </div>

          <div class="attempt-evidence">
            <strong>本次有效作答 {{ gradeResult.answered_count ?? 0 }} / {{ gradeResult.question_count ?? questions.length }} 题</strong>
            <span>
              完成度 {{ Math.round(Number(gradeResult.completion_rate || 0) * 100) }}%，{{ gradeResult.profile_updated
                ? '已纳入长期学习质量证据'
                : '本次结果不纳入长期学习质量证据' }}
            </span>
          </div>

          <section v-if="gradeResult.weak_points?.length" class="result-block">
            <h3>当前薄弱点</h3>
            <ul>
              <li v-for="item in gradeResult.weak_points" :key="item">{{ item }}</li>
            </ul>
          </section>

          <section v-if="diagnosticReport" class="result-block report-block">
            <h3>诊断与补弱报告</h3>
            <MarkdownRenderer :content="diagnosticReport" />
          </section>

          <div class="result-actions">
            <button type="button" @click="retryWrongQuestions">只重做错题</button>
            <button type="button" @click="goDiagnosis">查看学习诊断</button>
          </div>
        </template>

        <template v-else-if="directAnswerVisible">
          <section class="result-block">
            <h3>题集参考答案</h3>
            <article v-for="item in directAnswers" :key="item.question_id" class="feedback-card">
              <strong>第 {{ item.question_index }} 题</strong>
              <p>{{ item.answer || '这道题暂无参考答案。' }}</p>
              <p v-if="item.explanation" class="muted">{{ item.explanation }}</p>
            </article>
          </section>
        </template>

        <div v-else class="empty-state">
          请先独立作答。提交后，客观题由规则精确判定，主观题由讯飞星火结合参考要点批改。
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getResourceArtifactAPI } from '@/api/resource'
import { gradeExerciseAPI, revealExerciseAnswersAPI } from '@/api/exercise'
import { useUserStore } from '@/stores/user'
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
const answersViewed = ref(false)
const diagnosticReport = computed(() => gradeResult.value?.diagnostic_report || '')

const fetchArtifact = async () => {
  const artifactId = route.params.artifactId
  if (!artifactId) return
  loading.value = true
  try {
    const res = await getResourceArtifactAPI(artifactId)
    if (res?.code === 200) {
      artifact.value = res.data
      questions.value = (res.data?.questions || []).map(item => ({ ...item, answer: '' }))
    }
  } catch (error) {
    console.error('练习题集加载失败:', error)
    ElMessage.error('练习题集加载失败')
  } finally {
    loading.value = false
  }
}

const showDirectAnswers = async () => {
  try {
    await ElMessageBox.confirm(
      '查看后仍可提交批改，但为避免污染学情，本次结果不会写入学生画像。是否继续？',
      '查看参考答案',
      { confirmButtonText: '继续查看', cancelButtonText: '继续作答', type: 'warning' }
    )
  } catch {
    return
  }
  try {
    const res = await revealExerciseAnswersAPI(artifact.value.artifact_id)
    if (res?.code !== 200) {
      ElMessage.error(res?.message || '参考答案加载失败')
      return
    }
    answersViewed.value = true
    gradeResult.value = null
    directAnswers.value = res.data || []
    directAnswerVisible.value = true
  } catch (error) {
    console.error('参考答案加载失败:', error)
  }
}

const submitAnswers = async () => {
  if (!artifact.value?.artifact_id) return
  const emptyCount = questions.value.filter(item => !String(item.answer || '').trim()).length
  if (emptyCount === questions.value.length) {
    ElMessage.warning('请至少填写一道题的答案')
    return
  }
  if (emptyCount) {
    try {
      await ElMessageBox.confirm(
        `还有 ${emptyCount} 道题未作答，未作答题将按 0 分计算。是否继续提交？`,
        '确认提交',
        { confirmButtonText: '继续提交', cancelButtonText: '返回作答', type: 'warning' }
      )
    } catch {
      return
    }
  }
  grading.value = true
  directAnswerVisible.value = false
  try {
    const res = await gradeExerciseAPI({
      artifact_id: artifact.value.artifact_id,
      answers_viewed: answersViewed.value,
      answers: questions.value.map(item => ({
        question_id: item.question_id,
        answer: item.answer
      }))
    })
    const data = res?.data || {}
    if (!data.success) {
      ElMessage.error(data.message || '批改失败，请稍后重试')
      return
    }
    gradeResult.value = data.grading
    if (data.profile) {
      userStore.updateLearningProfile(data.profile)
      window.dispatchEvent(new CustomEvent('lingxi-profile-updated', {
        detail: data.profile
      }))
    }
    ElMessage.success(data.message || '批改完成')
  } catch (error) {
    console.error('批改失败:', error)
  } finally {
    grading.value = false
  }
}

const resultFor = (questionId) => gradeResult.value?.per_question?.find(item => item.question_id === questionId)
const resultClass = (questionId) => {
  const result = resultFor(questionId)
  return result ? `result-${result.status}` : ''
}
const statusLabel = (status) => ({
  correct: '回答正确',
  partial: '部分正确',
  incorrect: '需要修正',
  skipped: '未作答'
}[status] || '已批改')
const answerPlaceholder = (question) => question.type === 'code'
  ? '在这里输入代码，并说明关键思路与复杂度...'
  : '请写出答案和判断依据，不要只写一个结论...'

const retryWrongQuestions = () => {
  const wrongIds = new Set((gradeResult.value?.per_question || [])
    .filter(item => item.status !== 'correct')
    .map(item => item.question_id))
  questions.value.forEach((question) => {
    if (wrongIds.has(question.question_id)) question.answer = ''
  })
  gradeResult.value = null
  directAnswerVisible.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goDiagnosis = () => router.push('/evaluation?refresh=1')
const goBack = () => router.push('/resource?module=personalized')

onMounted(fetchArtifact)
</script>

<style scoped>
.exercise-practice-page { min-height: 100%; padding: 20px; background: #f7f8fa; box-sizing: border-box; overflow-y: auto; }
.practice-header { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 14px; }
.practice-header button { border: 1px solid #dbe3ef; border-radius: 8px; padding: 9px 12px; background: #fff; color: #334155; cursor: pointer; }
.practice-header span, .panel-title span { color: #2563eb; font-size: 13px; font-weight: 700; }
.practice-header h1, .panel-title h2 { margin: 4px 0 8px; color: #111827; line-height: 1.3; }
.practice-header p { margin: 0; color: #4b5563; }
.practice-steps { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; color: #94a3b8; }
.practice-steps span.active { color: #1677ff; font-weight: 800; }
.practice-steps i { font-style: normal; }
.viewed-warning { margin-bottom: 14px; padding: 12px 14px; border: 1px solid #fcd34d; border-radius: 8px; background: #fffbeb; color: #92400e; }
.practice-layout { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(360px, .85fr); gap: 18px; align-items: start; }
.practice-panel { display: grid; gap: 16px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; }
.question-card, .feedback-card, .empty-state { border: 1px solid #e5e7eb; border-radius: 10px; background: #f9fafb; }
.question-card { display: grid; gap: 12px; padding: 16px; }
.question-card.result-correct { border-color: #86efac; background: #f0fdf4; }
.question-card.result-partial { border-color: #fcd34d; background: #fffbeb; }
.attempt-evidence { display: grid; gap: 4px; padding: 12px 14px; border: 1px solid #bfdbfe; border-radius: 9px; background: #eff6ff; color: #1e3a8a; }
.attempt-evidence span { font-size: 13px; color: #475569; }
.question-card.result-incorrect, .question-card.result-skipped { border-color: #fca5a5; background: #fff7f7; }
.question-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.question-head div { display: flex; align-items: center; gap: 10px; }
.question-head strong { color: #111827; }
.question-head span, .question-head em, .knowledge-tag { color: #475569; font-size: 13px; font-style: normal; }
.question-head span, .knowledge-tag { padding: 4px 8px; border-radius: 999px; background: #eef2ff; }
.knowledge-tag { justify-self: start; }
.option-list { display: grid; gap: 10px; }
.boolean-list { grid-template-columns: 1fr 1fr; }
.option-item { display: flex; gap: 10px; align-items: center; padding: 11px 12px; border: 1px solid #dbe3ef; border-radius: 8px; background: #fff; cursor: pointer; }
.option-item:has(input:checked) { border-color: #1677ff; background: #eff6ff; }
.option-item b { color: #2563eb; }
textarea { width: 100%; border: 1px solid #dbe3ef; border-radius: 8px; padding: 12px; resize: vertical; font: inherit; line-height: 1.6; box-sizing: border-box; background: #fff; }
.code-answer { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.inline-feedback { display: grid; grid-template-columns: 1fr auto; gap: 8px 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; }
.inline-feedback strong { color: #0f172a; }
.inline-feedback span { color: #475569; font-weight: 700; }
.inline-feedback p, .inline-feedback details { grid-column: 1 / -1; margin: 0; color: #475569; line-height: 1.7; }
.inline-feedback summary { cursor: pointer; color: #2563eb; font-weight: 700; }
.action-row, .result-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.submit-btn, .answer-btn, .result-actions button { border: 0; border-radius: 8px; padding: 11px 16px; font-weight: 700; cursor: pointer; }
.submit-btn, .result-actions button:first-child { background: #1677ff; color: #fff; }
.answer-btn, .result-actions button:last-child { border: 1px solid #dbe3ef; background: #fff; color: #334155; }
button:disabled { opacity: .6; cursor: not-allowed; }
.result-panel { position: sticky; top: 16px; }
.score-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.score-card { display: grid; gap: 3px; padding: 15px; border: 1px solid #bfdbfe; border-radius: 10px; background: #eff6ff; }
.score-card small { color: #475569; }
.score-card strong { font-size: 34px; color: #1677ff; }
.score-card span { color: #1e40af; font-weight: 700; }
.mastery-card { border-color: #c4b5fd; background: #f5f3ff; }
.mastery-card strong { color: #7c3aed; }
.mastery-card span { color: #5b21b6; }
.profile-state { padding: 11px 13px; border-radius: 8px; background: #ecfdf5; color: #047857; line-height: 1.5; }
.profile-state.muted { background: #fffbeb; color: #92400e; }
.result-block { display: grid; gap: 10px; }
.result-block h3 { margin: 0; color: #111827; }
.result-block ul { margin: 0; padding-left: 20px; color: #475569; line-height: 1.8; }
.feedback-card, .empty-state { padding: 14px; }
.feedback-card p, .empty-state { color: #4b5563; line-height: 1.7; }
.muted { color: #6b7280; }
.report-block { border-top: 1px solid #e5e7eb; padding-top: 14px; }
@media (max-width: 900px) { .practice-layout { grid-template-columns: 1fr; } .result-panel { position: static; } .score-grid { grid-template-columns: 1fr; } }
</style>
