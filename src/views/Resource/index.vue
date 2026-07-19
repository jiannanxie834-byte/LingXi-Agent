<template>
  <div class="resource-framework-page" v-loading="loading">
    <main v-if="activeModule === 'course'" class="framework-layout">
      <aside class="course-tree">
        <nav class="tree-module-tabs" aria-label="资源工厂模块">
          <button
            type="button"
            :class="{ active: activeModule === 'course' }"
            @click="activeModule = 'course'"
          >
            初始资源
          </button>
          <button
            type="button"
            :class="{ active: activeModule === 'personalized' }"
            @click="openPersonalizedModule"
          >
            个性化资源
          </button>
        </nav>
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
              初始资源库保存课程结构、章节资源入口、题库、代码任务、视频条目、课程依据与生成规范。
              学生后续提出学习需求时，系统会先定位课程主题，再结合画像生成新的个性化学习资源。
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

    <main v-else class="personalized-layout" v-loading="personalizedLoading">
      <nav class="personalized-module-tabs" aria-label="资源工厂模块">
        <button type="button" @click="activeModule = 'course'">课程初始资源库</button>
        <button type="button" class="active">个性化生成资源</button>
      </nav>

      <section class="personalized-toolbar">
        <label>
          <span>搜索</span>
          <input v-model="personalizedKeyword" type="search" placeholder="输入标题或知识点" @input="personalizedPage = 1">
        </label>
        <label>
          <span>资源类型</span>
          <select v-model="personalizedType" @change="personalizedPage = 1">
            <option value="">全部类型</option>
            <option v-for="type in personalizedTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </label>
        <strong>共 {{ filteredPersonalizedResources.length }} 份</strong>
      </section>

      <section v-if="!filteredPersonalizedResources.length" class="panel empty-personalized">
        <h3>{{ personalizedResources.length ? '没有匹配的资源' : '暂无已通过的个性化资源' }}</h3>
        <p>{{ personalizedResources.length ? '请调整搜索词或资源类型。' : '你可以先在首页提出学习需求，生成并审核通过后会在这里出现。' }}</p>
      </section>

      <section v-else class="personalized-grid">
        <article
          v-for="artifact in pagedPersonalizedResources"
          :key="artifact.artifact_id"
          class="personalized-card"
        >
          <div class="artifact-type">{{ artifact.type }}</div>
          <h3>{{ artifact.title }}</h3>
          <p>{{ artifact.summary || '这是一份结合学习需求与画像生成的个性化资源。' }}</p>
          <div class="artifact-meta">
            <span>{{ artifact.created_at || artifact.updated_at || '暂无时间' }}</span>
            <span>{{ artifact.status === 'published' ? '已通过' : '可查看' }}</span>
          </div>
          <button type="button" @click="openArtifactDetail(artifact)">
            {{ isExerciseArtifact(artifact) ? '查看题目' : '查看资源' }}
          </button>
        </article>
      </section>

      <nav v-if="personalizedTotalPages > 1" class="resource-pagination" aria-label="个性化资源分页">
        <button type="button" :disabled="personalizedPage <= 1" @click="personalizedPage -= 1">上一页</button>
        <span>第 {{ personalizedPage }} / {{ personalizedTotalPages }} 页</span>
        <button type="button" :disabled="personalizedPage >= personalizedTotalPages" @click="personalizedPage += 1">下一页</button>
      </nav>
    </main>

    <el-dialog
      v-model="artifactDialogVisible"
      width="78%"
      class="artifact-dialog"
      destroy-on-close
    >
      <template #header>
        <div class="artifact-dialog-title">
          <span>{{ selectedArtifact?.type || '个性化资源' }}</span>
          <h3>{{ selectedArtifact?.title || '资源详情' }}</h3>
        </div>
      </template>
      <div v-if="selectedArtifact" class="artifact-detail">
        <p class="artifact-summary">{{ selectedArtifact.summary || '暂无摘要' }}</p>
        <section v-if="playableAssets.length" class="playable-assets" aria-label="可播放多媒体产物">
          <div v-for="asset in playableAssets" :key="asset.url" class="playable-asset-card">
            <div class="playable-asset-heading">
              <div>
                <span>可播放产物</span>
                <strong>{{ asset.title || '个性化教学动画' }}</strong>
              </div>
              <small v-if="asset.duration_seconds">约 {{ asset.duration_seconds }} 秒</small>
            </div>
            <iframe
              v-if="asset.mime_type === 'text/html'"
              class="playable-frame"
              :src="asset.url"
              :title="asset.title || '个性化教学动画'"
              sandbox="allow-scripts"
            />
            <video
              v-else
              class="playable-video"
              :src="asset.url"
              controls
              preload="metadata"
            />
          </div>
        </section>
        <div v-if="isExerciseArtifact(selectedArtifact)" class="exercise-entry">
          <div>
            <strong>练习题集</strong>
            <span>共 {{ selectedArtifact.question_count || selectedArtifact.questions?.length || 0 }} 题。进入作答页后按题型作答，提交前不展示答案与解析。</span>
          </div>
          <button type="button" @click="startExercise(selectedArtifact)">开始练习</button>
        </div>
        <MarkdownRenderer v-else :content="selectedArtifact.content || '暂无正文内容'" />
      </div>
      <template #footer>
        <button type="button" class="dialog-close-btn" @click="artifactDialogVisible = false">关闭</button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  getDsaChapterDetailAPI,
  getDsaCourseTreeAPI,
  getDsaSectionDetailAPI,
  getResourceArtifactAPI,
  getResourceArtifactsAPI
} from '@/api/resource'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'
import MermaidBlock from '@/components/MermaidBlock.vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const chapterLoading = ref(false)
const sectionLoading = ref(false)
const personalizedLoading = ref(false)
const activeModule = ref('course')
const framework = ref({})
const personalizedResources = ref([])
const personalizedKeyword = ref('')
const personalizedType = ref('')
const personalizedPage = ref(1)
const personalizedPageSize = 12
const artifactDialogVisible = ref(false)
const selectedArtifact = ref(null)
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
const personalizedTypeCount = computed(() => new Set(personalizedResources.value.map(item => item.type).filter(Boolean)).size)
const personalizedTypes = computed(() => [...new Set(personalizedResources.value.map(item => item.type).filter(Boolean))].sort())
const filteredPersonalizedResources = computed(() => {
  const keyword = personalizedKeyword.value.trim().toLowerCase()
  return personalizedResources.value.filter((item) => {
    const typeMatches = !personalizedType.value || item.type === personalizedType.value
    const keywordMatches = !keyword || [item.title, item.summary, item.type]
      .some(value => String(value || '').toLowerCase().includes(keyword))
    return typeMatches && keywordMatches
  })
})
const personalizedTotalPages = computed(() => Math.max(1, Math.ceil(filteredPersonalizedResources.value.length / personalizedPageSize)))
const pagedPersonalizedResources = computed(() => {
  const safePage = Math.min(personalizedPage.value, personalizedTotalPages.value)
  const start = (safePage - 1) * personalizedPageSize
  return filteredPersonalizedResources.value.slice(start, start + personalizedPageSize)
})
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
const isExerciseArtifact = (artifact = {}) => {
  const type = String(artifact?.type || '')
  return type.includes('练习题') || type === 'exercise_set'
}
const playableAssets = computed(() => (selectedArtifact.value?.assets || []).filter(asset => (
  asset?.url && (asset.mime_type === 'text/html' || String(asset.mime_type || '').startsWith('video/'))
)))
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

const fetchPersonalizedResources = async () => {
  personalizedLoading.value = true
  try {
    const res = await getResourceArtifactsAPI({
      username: userStore.username || 'student',
      status: 'published',
      include_public: false,
      limit: 200
    })
    if (res?.code === 200) {
      personalizedResources.value = (res.data || []).sort((a, b) => {
        const bTime = new Date(String(b.updated_at || b.created_at || '').replace(/-/g, '/')).getTime() || 0
        const aTime = new Date(String(a.updated_at || a.created_at || '').replace(/-/g, '/')).getTime() || 0
        return bTime - aTime
      })
    }
  } catch (error) {
    console.error('个性化资源加载失败:', error)
    ElMessage.error('个性化资源加载失败')
  } finally {
    personalizedLoading.value = false
  }
}

const openPersonalizedModule = async () => {
  activeModule.value = 'personalized'
  await fetchPersonalizedResources()
}

const openArtifactDetail = async (artifact) => {
  selectedArtifact.value = artifact
  artifactDialogVisible.value = true
  if (!artifact?.artifact_id) return
  try {
    const res = await getResourceArtifactAPI(artifact.artifact_id)
    if (res?.code === 200) {
      selectedArtifact.value = res.data
    }
  } catch (error) {
    console.error('资源详情加载失败:', error)
    ElMessage.error('资源详情加载失败')
  }
}

const startExercise = (artifact) => {
  const artifactId = artifact?.artifact_id
  if (!artifactId) {
    ElMessage.warning('练习题集编号缺失，无法进入做题页')
    return
  }
  artifactDialogVisible.value = false
  router.push(`/exercise/${encodeURIComponent(artifactId)}`)
}

onMounted(() => {
  const targetArtifactId = route.query?.artifact_id || ''
  const targetModule = route.query?.module || ''
  if (targetModule === 'personalized' || targetArtifactId) {
    activeModule.value = 'personalized'
  }
  fetchFramework()
  fetchPersonalizedResources().then(async () => {
    if (!targetArtifactId) return
    const target = personalizedResources.value.find(item => item.artifact_id === targetArtifactId) || { artifact_id: targetArtifactId }
    await openArtifactDetail(target)
  })
})
</script>

<style scoped>
.resource-framework-page {
  min-height: 100%;
  padding: 14px 20px 20px;
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
  min-height: calc(100vh - 154px);
}
.resource-module-tabs,
.personalized-module-tabs {
  display: inline-flex;
  gap: 8px;
  padding: 4px;
  margin: 0 0 18px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.resource-module-tabs button,
.personalized-module-tabs button {
  border: 0;
  border-radius: 6px;
  padding: 10px 16px;
  background: transparent;
  color: #4b5563;
  font-weight: 700;
  cursor: pointer;
}
.resource-module-tabs button.active,
.personalized-module-tabs button.active {
  background: #1677ff;
  color: #fff;
}
.tree-module-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
}
.tree-module-tabs button {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 8px;
  background: #fff;
  color: #4b5563;
  font-weight: 700;
  cursor: pointer;
}
.tree-module-tabs button.active {
  border-color: #1677ff;
  background: #1677ff;
  color: #fff;
}
.personalized-layout {
  display: grid;
  gap: 16px;
}
.personalized-toolbar {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(180px, 260px) auto;
  gap: 12px;
  align-items: end;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.personalized-toolbar label {
  display: grid;
  gap: 6px;
}
.personalized-toolbar label span {
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}
.personalized-toolbar input,
.personalized-toolbar select {
  width: 100%;
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid #dbe3ef;
  border-radius: 7px;
  background: #fff;
  color: #111827;
  box-sizing: border-box;
}
.personalized-toolbar strong {
  padding: 10px 2px;
  color: #2563eb;
  white-space: nowrap;
}
.personalized-hero span {
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}
.empty-personalized {
  color: #4b5563;
}
.personalized-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}
.resource-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  color: #475569;
}
.resource-pagination button {
  border: 1px solid #dbe3ef;
  border-radius: 7px;
  padding: 8px 13px;
  background: #fff;
  color: #334155;
  cursor: pointer;
}
.resource-pagination button:disabled {
  opacity: .5;
  cursor: not-allowed;
}
.personalized-card {
  display: grid;
  gap: 12px;
  min-height: 230px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}
.personalized-card h3 {
  margin: 0;
  color: #111827;
  line-height: 1.35;
}
.personalized-card p {
  margin: 0;
  color: #4b5563;
  line-height: 1.7;
}
.artifact-type {
  justify-self: start;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 700;
}
.artifact-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #6b7280;
  font-size: 13px;
}
.personalized-card button,
.dialog-close-btn,
.dialog-primary-btn,
.exercise-entry button {
  justify-self: start;
  border: 0;
  border-radius: 6px;
  padding: 9px 14px;
  background: #1677ff;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
.personalized-card button:hover,
.dialog-close-btn:hover,
.dialog-primary-btn:hover,
.exercise-entry button:hover {
  background: #0958d9;
}
.dialog-primary-btn {
  margin-right: 10px;
}
.exercise-entry {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
}
.exercise-entry strong,
.exercise-entry span {
  display: block;
}
@media (max-width: 720px) {
  .personalized-toolbar {
    grid-template-columns: 1fr;
  }
}
.exercise-entry strong {
  color: #1d4ed8;
  margin-bottom: 4px;
}
.exercise-entry span {
  color: #4b5563;
  line-height: 1.6;
}
.artifact-dialog-title span {
  display: inline-block;
  margin-bottom: 6px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}
.artifact-dialog-title h3 {
  margin: 0;
  color: #111827;
  line-height: 1.35;
}
.artifact-detail {
  display: grid;
  gap: 16px;
}
.artifact-summary {
  margin: 0;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  color: #4b5563;
  line-height: 1.7;
}
.playable-assets {
  display: grid;
  gap: 14px;
}
.playable-asset-card {
  overflow: hidden;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  background: #eff6ff;
}
.playable-asset-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 16px;
}
.playable-asset-heading div {
  display: grid;
  gap: 3px;
}
.playable-asset-heading span {
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}
.playable-asset-heading strong {
  color: #172554;
}
.playable-asset-heading small {
  flex: none;
  color: #64748b;
}
.playable-frame,
.playable-video {
  display: block;
  width: 100%;
  border: 0;
  background: #0f172a;
}
.playable-frame {
  height: min(520px, 62vh);
}
.playable-video {
  max-height: 520px;
}
.course-tree,
.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.course-tree {
  position: sticky;
  top: 14px;
  height: calc(100vh - 154px);
  min-height: 560px;
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
    position: static;
    height: auto;
    min-height: 0;
  }
}
</style>
