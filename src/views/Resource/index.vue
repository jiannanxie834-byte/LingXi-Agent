<template>
  <div class="resource-framework-page" v-loading="loading">
    <header class="framework-header">
      <div>
        <span class="course-label">灵析学伴 · 数据结构与算法个性化学习系统</span>
        <h1>{{ courseTitle }}</h1>
        <p>资源工厂展示课程树、章节基础资源、小节讲解、练习与代码任务索引。点击章节查看章节概述，点击小节查看对应 Markdown 正文。</p>
      </div>
      <div class="framework-summary">
        <strong>{{ chapterCount }}</strong>
        <span>章</span>
        <strong>{{ sectionCount }}</strong>
        <span>小节</span>
      </div>
    </header>

    <main class="framework-layout">
      <aside class="course-tree">
        <div class="tree-title">
          <strong>课程树</strong>
          <span>课程 → 章节 → 小节</span>
        </div>
        <button
          type="button"
          class="course-root"
          :class="{ active: selectedType === 'course' }"
          @click="selectCourse"
        >
          数据结构与算法
        </button>
        <div
          v-for="chapter in chapters"
          :key="chapter.chapter_id"
          class="chapter-node"
        >
          <button
            type="button"
            class="chapter-button"
            :class="{ active: selectedChapterId === chapter.chapter_id && selectedType === 'chapter' }"
            @click="selectChapter(chapter)"
          >
            <span>第 {{ chapter.chapter_no }} 章</span>
            <strong>{{ shortChapterTitle(chapter.title) }}</strong>
          </button>
          <div class="section-list">
            <button
              v-for="section in chapter.sections || []"
              :key="section.section_id"
              type="button"
              class="section-button"
              :class="{ active: selectedSectionId === section.section_id }"
              @click.stop.prevent="selectSection(chapter, section)"
            >
              {{ section.title }}
            </button>
          </div>
        </div>
      </aside>

      <section class="framework-main">
        <template v-if="selectedType === 'course'">
          <div class="panel hero-panel">
            <span>课程框架</span>
            <h2>以章节级基础资源和条目级索引支撑后续个性化生成</h2>
            <p>
              初始资源库保存课程结构、章节资源入口、题库、代码任务、视频条目、evidence 和 policy。
              学生后续提出学习需求时，系统会先命中 section_id / unit_id，再结合画像生成 ResourceArtifact。
            </p>
          </div>
          <div class="chapter-grid">
            <button
              v-for="chapter in chapters"
              :key="chapter.chapter_id"
              type="button"
              class="chapter-card"
              @click="selectChapter(chapter)"
            >
              <span>第 {{ chapter.chapter_no }} 章</span>
              <strong>{{ shortChapterTitle(chapter.title) }}</strong>
              <em>{{ (chapter.sections || []).length }} 个小节</em>
            </button>
          </div>
        </template>

        <template v-else>
          <div class="panel chapter-panel">
            <span>{{ selectedType === 'section' ? '小节讲解' : '章节资源' }}</span>
            <h2>{{ displayTitle }}</h2>
            <p>{{ displaySummary }}</p>
          </div>

          <section
            v-if="selectedType === 'section' && sectionLoading"
            ref="sectionContentPanel"
            class="panel section-state-panel"
          >
            正在加载小节正文...
          </section>

          <section
            v-else-if="selectedType === 'section' && sectionError"
            ref="sectionContentPanel"
            class="panel section-state-panel error"
          >
            {{ sectionError }}
          </section>

          <section
            v-else-if="selectedType === 'section' && selectedSectionContent"
            ref="sectionContentPanel"
            class="panel markdown-panel"
          >
            <MarkdownRenderer :content="selectedSectionContent" />
          </section>

          <template v-if="selectedType === 'chapter'">
            <section class="panel">
              <h3>本章小节</h3>
              <div class="section-grid">
                <button
                  v-for="section in selectedChapter?.sections || []"
                  :key="section.section_id"
                  type="button"
                  class="section-card"
                  @click.stop.prevent="selectSection(selectedChapter, section)"
                >
                  <strong>{{ section.title }}</strong>
                  <span>点击查看小节正文</span>
                </button>
              </div>
            </section>

            <section v-if="chapterOverviewContent" class="panel markdown-panel">
              <div class="resource-preview-title">
                <span>章节概述</span>
                <h3>{{ selectedChapter?.title }} 学习导引</h3>
              </div>
              <MarkdownRenderer :content="chapterOverviewContent" />
            </section>

            <section v-if="chapterMindMapContent" class="panel markdown-panel mind-map-panel">
              <div class="resource-preview-title">
                <span>思维导图</span>
                <h3>{{ selectedChapter?.title }} 结构图</h3>
              </div>
              <MermaidBlock :code="chapterMindMapContent" />
            </section>

            <section v-if="chapterReadingGuideContent" class="panel markdown-panel">
              <div class="resource-preview-title">
                <span>阅读与视频指南</span>
                <h3>本章学习建议</h3>
              </div>
              <MarkdownRenderer :content="chapterReadingGuideContent" />
            </section>
          </template>

          <section v-if="selectedType === 'section' && hasSectionLearningItems" class="panel learning-items-panel">
            <div class="resource-preview-title">
              <span>配套练习与任务</span>
              <h3>{{ selectedSection?.title }} 的学习材料</h3>
            </div>

            <div v-if="sectionExercises.length" class="item-group">
              <h4>练习题</h4>
              <article
                v-for="exercise in sectionExercises"
                :key="exercise.exercise_id"
                class="learning-item-card"
              >
                <div class="item-head">
                  <strong>{{ exercise.title }}</strong>
                  <span>{{ exercise.type }} · {{ difficultyLabel(exercise.difficulty) }}</span>
                </div>
                <p>{{ exercise.stem }}</p>
                <details>
                  <summary>查看答案与解析</summary>
                  <div class="answer-block">
                    <b>答案：</b>{{ exercise.answer }}
                    <br>
                    <b>解析：</b>{{ exercise.explanation }}
                    <template v-if="exercise.common_mistakes?.length">
                      <br>
                      <b>常见错误：</b>{{ formatList(exercise.common_mistakes) }}
                    </template>
                  </div>
                </details>
              </article>
            </div>

            <div v-if="sectionCodeTasks.length" class="item-group">
              <h4>代码任务</h4>
              <article
                v-for="task in sectionCodeTasks"
                :key="task.task_id"
                class="learning-item-card"
              >
                <div class="item-head">
                  <strong>{{ task.title }}</strong>
                  <span>{{ task.language }} · {{ difficultyLabel(task.difficulty) }}</span>
                </div>
                <pre><code>{{ task.starter_code }}</code></pre>
                <ul>
                  <li v-for="todo in task.student_tasks || []" :key="todo">{{ todo }}</li>
                </ul>
                <details>
                  <summary>查看参考分析</summary>
                  <div class="answer-block">{{ task.solution }}</div>
                </details>
              </article>
            </div>

            <div v-if="sectionVideoItems.length" class="item-group">
              <h4>视频学习条目</h4>
              <article
                v-for="video in sectionVideoItems"
                :key="video.video_item_id"
                class="learning-item-card"
              >
                <div class="item-head">
                  <strong>{{ video.title }}</strong>
                  <span>{{ video.platform || '视频资源' }}</span>
                </div>
                <p>观看重点：{{ formatList(video.watch_focus) }}</p>
                <p>观看前：{{ formatList(video.before_watch) }}</p>
                <p>观看后任务：{{ formatList(video.after_watch_tasks) }}</p>
                <a
                  v-if="video.source_url"
                  class="video-link"
                  :href="video.source_url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  打开视频
                </a>
              </article>
            </div>
          </section>

        </template>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getDsaChapterDetailAPI,
  getDsaCourseTreeAPI,
  getDsaSectionDetailAPI
} from '@/api/resource'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'
import MermaidBlock from '@/components/MermaidBlock.vue'

const loading = ref(false)
const chapterLoading = ref(false)
const sectionLoading = ref(false)
const framework = ref({})
const selectedChapterDetail = ref(null)
const selectedSectionDetail = ref(null)
const selectedSectionStub = ref(null)
const sectionError = ref('')
const sectionContentPanel = ref(null)
const selectedType = ref('course')
const selectedChapterId = ref('')
const selectedSectionId = ref('')
let sectionRequestToken = 0

const chapters = computed(() => framework.value?.chapters || [])
const courseTitle = computed(() => framework.value?.course_title || '数据结构与算法：可视化理解与代码实践')
const chapterCount = computed(() => chapters.value.length)
const sectionCount = computed(() => chapters.value.reduce((sum, chapter) => sum + (chapter.sections || []).length, 0))
const selectedChapter = computed(() => {
  if (selectedChapterDetail.value?.chapter_id === selectedChapterId.value) return selectedChapterDetail.value
  return chapters.value.find(item => item.chapter_id === selectedChapterId.value) || chapters.value[0] || null
})
const selectedSection = computed(() => {
  if (selectedSectionDetail.value?.section_id === selectedSectionId.value) return selectedSectionDetail.value
  if (selectedSectionStub.value?.section_id === selectedSectionId.value) return selectedSectionStub.value
  if (!selectedChapter.value) return null
  return (selectedChapter.value.sections || []).find(item => item.section_id === selectedSectionId.value) || null
})
const selectedMap = computed(() => {
  if (!selectedChapter.value || !selectedSectionId.value) return null
  return selectedChapter.value.section_resource_map?.[selectedSectionId.value] || null
})
const selectedSectionUnitIds = computed(() => selectedSection.value?.unit_ids || selectedMap.value?.unit_ids || [])
const selectedSectionContent = computed(() => selectedSectionDetail.value?.content || selectedSection.value?.content || '')
const chapterResource = (path) => selectedChapter.value?.resource_contents?.[path]?.content || ''
const chapterOverviewContent = computed(() => selectedChapter.value?.overview || chapterResource('resources/chapter_overview.md'))
const chapterMindMapContent = computed(() => selectedChapter.value?.mind_map || chapterResource('resources/mind_map.mmd'))
const chapterReadingGuideContent = computed(() => selectedChapter.value?.reading_video_guide || chapterResource('resources/reading_video_guide.md'))
const selectedSectionIds = computed(() => selectedSection.value ? [selectedSection.value.section_id] : [])
const chapterBanks = computed(() => selectedChapter.value?.resources || selectedChapter.value?.banks || {})
const itemMatchesSection = (item = {}) => {
  const sectionIds = item.section_ids || []
  const unitIds = item.unit_ids || []
  return sectionIds.some(id => selectedSectionIds.value.includes(id))
    || unitIds.some(id => selectedSectionUnitIds.value.includes(id))
}
const sectionRelated = computed(() => selectedSectionDetail.value?.related || {})
const sectionExercises = computed(() => sectionRelated.value.exercises || (chapterBanks.value.exercises || []).filter(itemMatchesSection))
const sectionCodeTasks = computed(() => sectionRelated.value.code_tasks || (chapterBanks.value.code_tasks || []).filter(itemMatchesSection))
const sectionVideoItems = computed(() => sectionRelated.value.video_items || (chapterBanks.value.video_items || []).filter(itemMatchesSection))
const hasSectionLearningItems = computed(() => (
  sectionExercises.value.length
  || sectionCodeTasks.value.length
  || sectionVideoItems.value.length
))
const shortChapterTitle = (title = '') => String(title).replace(/^第\s*\d+\s*章\s*/, '')
const difficultyLabel = (difficulty = '') => {
  const labels = {
    basic: '基础',
    medium: '中等',
    hard: '进阶',
    easy: '基础',
    基础: '基础',
    中等: '中等',
    进阶: '进阶',
    困难: '困难'
  }
  return labels[difficulty] || difficulty || '未标注'
}
const formatList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join('；')
  if (value === null || value === undefined || value === '') return '暂无'
  return String(value)
}

const selectCourse = () => {
  selectedType.value = 'course'
  selectedChapterId.value = ''
  selectedSectionId.value = ''
  selectedChapterDetail.value = null
  selectedSectionDetail.value = null
  selectedSectionStub.value = null
  sectionError.value = ''
}

const selectChapter = async (chapter) => {
  if (!chapter) return
  const chapterId = chapter.chapter_id || chapter.id
  if (!chapterId) {
    ElMessage.warning('章节参数缺失，无法打开内容')
    return
  }
  selectedType.value = 'chapter'
  selectedChapterId.value = chapterId
  selectedSectionId.value = ''
  selectedSectionDetail.value = null
  selectedSectionStub.value = null
  sectionError.value = ''
  sectionRequestToken += 1
  chapterLoading.value = true
  try {
    const res = await getDsaChapterDetailAPI(chapterId)
    if (res?.code === 200) {
      selectedChapterDetail.value = res.data
    }
  } catch (error) {
    console.error('章节内容加载失败:', error)
  } finally {
    chapterLoading.value = false
  }
}

const selectSection = async (chapter, section) => {
  const chapterId = chapter?.chapter_id || chapter?.id || selectedChapterId.value
  const sectionId = section?.section_id || section?.id
  if (!chapterId || !sectionId) {
    ElMessage.warning('小节参数缺失，无法打开内容')
    return
  }
  const requestToken = ++sectionRequestToken
  selectedType.value = 'section'
  selectedChapterId.value = chapterId
  selectedSectionId.value = sectionId
  selectedSectionStub.value = {
    ...section,
    chapter_id: chapterId,
    section_id: sectionId,
    title: section?.title || section?.name || '小节正文'
  }
  selectedSectionDetail.value = null
  sectionError.value = ''
  sectionLoading.value = true
  chapterLoading.value = false
  await nextTick()
  scrollToSectionContent()
  try {
    const res = await getDsaSectionDetailAPI(chapterId, sectionId)
    if (requestToken !== sectionRequestToken) return
    if (res?.code === 200 && res.data?.content) {
      selectedSectionDetail.value = res.data
      sectionError.value = ''
      await nextTick()
      scrollToSectionContent()
    } else {
      sectionError.value = res?.message || '小节内容不存在'
      ElMessage.error(sectionError.value)
    }
  } catch (error) {
    console.error('小节内容加载失败:', error)
    if (requestToken === sectionRequestToken) {
      sectionError.value = '小节内容加载失败'
    }
  } finally {
    if (requestToken === sectionRequestToken) {
      sectionLoading.value = false
    }
  }
}

const scrollToSectionContent = () => {
  window.requestAnimationFrame(() => {
    sectionContentPanel.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  })
}

const displayTitle = computed(() => {
  if (selectedType.value === 'section') return selectedSection.value?.title || '小节框架'
  return selectedChapter.value?.title || '章节框架'
})

const displaySummary = computed(() => {
  if (selectedType.value === 'section') {
    if (sectionLoading.value) return '正在读取该小节的课程正文。'
    if (sectionError.value) return sectionError.value
    return selectedSectionContent.value
      ? '本小节已接入基础讲解正文，可配合右侧章节资源、题库和代码任务学习。'
      : '请选择左侧小节查看正文。'
  }
  return selectedChapter.value?.manifest?.stage === 'curated_base_resource'
    ? '本章已接入章节概述、小节讲解、练习题、代码任务、视频学习指南和资源索引。'
    : '本章包含小节框架、结构化题库、代码任务、视频条目和教学元数据。'
})

const fetchFramework = async () => {
  loading.value = true
  try {
    const res = await getDsaCourseTreeAPI()
    if (res?.code === 200) {
      framework.value = res.data || {}
      if (chapters.value.length) {
        await selectChapter(chapters.value[0])
      }
    }
  } catch (error) {
    console.error('课程框架加载失败:', error)
    ElMessage.error('课程框架加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchFramework)
</script>

<style scoped>
.resource-framework-page {
  min-height: 100%;
  padding: 20px;
  background: #f7f8fa;
  box-sizing: border-box;
  overflow-y: auto;
}
.framework-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 18px;
}
.course-label {
  display: inline-block;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
}
.framework-header h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.25;
  color: #111827;
}
.framework-header p {
  margin: 10px 0 0;
  max-width: 760px;
  color: #4b5563;
  line-height: 1.7;
}
.framework-summary {
  display: grid;
  grid-template-columns: auto auto;
  gap: 4px 8px;
  align-items: baseline;
  padding: 14px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #6b7280;
}
.framework-summary strong {
  font-size: 24px;
  color: #1677ff;
}
.framework-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
.course-tree,
.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.course-tree {
  max-height: calc(100vh - 210px);
  overflow-y: auto;
  padding: 14px;
}
.tree-title {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.tree-title strong {
  color: #111827;
}
.tree-title span {
  color: #6b7280;
  font-size: 12px;
}
.course-root,
.chapter-button,
.section-button,
.chapter-card,
.section-card {
  width: 100%;
  border: 1px solid #e5e7eb;
  background: #fff;
  text-align: left;
  cursor: pointer;
}
.course-root {
  border-radius: 8px;
  padding: 11px 12px;
  margin-bottom: 10px;
  font-weight: 700;
  color: #111827;
}
.chapter-node {
  display: grid;
  gap: 6px;
  margin-bottom: 10px;
}
.chapter-button {
  border-radius: 8px;
  padding: 10px 12px;
}
.chapter-button span {
  display: block;
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 4px;
}
.chapter-button strong {
  color: #111827;
  line-height: 1.35;
}
.section-list {
  display: grid;
  gap: 5px;
  padding-left: 12px;
}
.section-button {
  border-radius: 6px;
  padding: 8px 10px;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.35;
}
.section-button:hover {
  border-color: #409eff;
  color: #2563eb;
  background: #eff6ff;
}
.course-root.active,
.chapter-button.active,
.section-button.active {
  border-color: #1677ff;
  background: #eff6ff;
  color: #1677ff;
  font-weight: 700;
}
.framework-main {
  display: grid;
  gap: 16px;
}
.panel {
  padding: 20px;
}
.hero-panel span,
.chapter-panel span {
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}
.panel h2,
.panel h3 {
  margin: 8px 0 10px;
  color: #111827;
  line-height: 1.3;
}
.panel p {
  margin: 0;
  color: #4b5563;
  line-height: 1.7;
}
.section-state-panel {
  color: #4b5563;
  line-height: 1.7;
}
.section-state-panel.error {
  color: #b42318;
  border-color: #fecaca;
  background: #fff7f7;
}
.chapter-grid,
.content-grid {
  display: grid;
  gap: 14px;
}
.chapter-grid {
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
}
.content-grid {
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.85fr);
  align-items: start;
}
.chapter-card,
.section-card {
  border-radius: 8px;
  padding: 16px;
}
.chapter-card span,
.chapter-card em,
.section-card span {
  display: block;
  color: #6b7280;
  font-size: 13px;
  font-style: normal;
}
.chapter-card strong,
.section-card strong {
  display: block;
  margin: 6px 0;
  color: #111827;
  font-size: 16px;
  line-height: 1.35;
}
.chapter-card:hover,
.section-card:hover {
  border-color: #1677ff;
  background: #f8fbff;
}
.section-grid,
.unit-list,
.placeholder-resources {
  display: grid;
  gap: 10px;
}
.unit-card,
.placeholder-card {
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}
.unit-card strong,
.placeholder-card strong {
  display: block;
  color: #111827;
  margin-bottom: 6px;
}
.placeholder-card span {
  display: inline-block;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
  margin-bottom: 8px;
}
.placeholder-card em {
  display: block;
  margin-top: 8px;
  color: #6b7280;
  font-size: 13px;
  font-style: normal;
}
.generation-flow {
  overflow: hidden;
}
.learning-items-panel,
.item-group {
  display: grid;
  gap: 12px;
}
.item-group h4 {
  margin: 4px 0 0;
  color: #111827;
  font-size: 18px;
}
.learning-item-card {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.item-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.item-head strong {
  color: #111827;
  line-height: 1.4;
}
.item-head span {
  flex: 0 0 auto;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
}
.learning-item-card p,
.learning-item-card ul {
  margin: 0;
  color: #4b5563;
  line-height: 1.7;
}
.learning-item-card ul {
  padding-left: 20px;
}
.learning-item-card pre {
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  background: #111827;
  color: #f9fafb;
  line-height: 1.6;
}
.learning-item-card details {
  color: #374151;
}
.learning-item-card summary {
  cursor: pointer;
  color: #1677ff;
  font-weight: 700;
}
.video-link {
  justify-self: start;
  color: #1677ff;
  background: #eff6ff;
  border-radius: 6px;
  padding: 7px 10px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}
.video-link:hover {
  background: #dbeafe;
}
.answer-block {
  margin-top: 8px;
  padding: 10px;
  border-radius: 8px;
  background: #f9fafb;
  color: #374151;
  line-height: 1.7;
}
.flow-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.flow-steps span {
  color: #374151;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
}
@media (max-width: 1100px) {
  .framework-layout,
  .content-grid {
    grid-template-columns: 1fr;
  }
  .course-tree {
    max-height: none;
  }
}
</style>
