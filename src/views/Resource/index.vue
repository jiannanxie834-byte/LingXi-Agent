<template>
  <div class="resource-page" v-loading="loading">
    <header class="resource-topbar">
      <div>
        <span class="course-label">灵析学伴 · 深度学习</span>
        <h1>《深度学习》课程资源中心</h1>
      </div>
      <div class="mode-tabs">
        <button
          v-for="mode in modes"
          :key="mode"
          type="button"
          :class="{ active: currentMode === mode }"
          @click="currentMode = mode"
        >
          {{ mode }}
        </button>
      </div>
    </header>

    <div class="resource-toolbar">
      <el-input
        v-model="searchKeyword"
        clearable
        placeholder="搜索章节、知识点、资源名称或正文内容"
      />
      <span class="result-count">{{ resultCountText }}</span>
      <div class="upload-action-bar">
        <el-button type="primary" @click="openUploadDialog">+ 贡献/上传深度学习资源</el-button>
        <el-button type="warning" plain @click="handleProposeNewType">申请新资源分类</el-button>
      </div>
    </div>

    <div v-if="currentMode === '章节学习中心'" class="chapter-layout">
      <ChapterResourceSidebar
        :chapters="chapterHubs"
        :selected-chapter-id="selectedChapterId"
        @select="selectedChapterId = $event"
      />

      <main class="chapter-main">
        <template v-if="searchKeyword.trim()">
          <section class="search-results">
            <h2>按章节分组的搜索结果</h2>
            <el-empty v-if="groupedSearchResults.length === 0" description="没有匹配到章节资源，换个关键词试试" />
            <div v-for="group in groupedSearchResults" :key="group.chapter_id" class="search-group">
              <h3>{{ group.chapter_title }}</h3>
              <ChapterResourceSection
                v-for="item in group.items"
                :key="item.source_file || item.resource_key"
                :item="item"
                :chapter-title="group.chapter_title"
                @view="handleView"
              />
            </div>
          </section>
        </template>
        <ChapterResourceHub
          v-else
          :hub="selectedHub"
          @view="handleView"
        />
      </main>

      <aside class="chapter-aside">
        <div class="aside-card">
          <strong>本章学习建议</strong>
          <p>{{ selectedHub?.summary || '请选择一个章节开始学习。' }}</p>
        </div>
        <div class="aside-card">
          <strong>推荐下一章</strong>
          <button v-if="nextHub" type="button" @click="selectedChapterId = nextHub.chapter_id">
            {{ nextHub.chapter_title }}
          </button>
          <p v-else>已经到达课程综合项目，可以进入项目报告与答辩准备。</p>
        </div>
      </aside>
    </div>

    <section v-else class="resource-list-mode">
      <el-empty v-if="filteredFlatResources.length === 0" :description="emptyDescription" />
      <div v-else class="resource-grid">
        <article
          v-for="item in filteredFlatResources"
          :key="item.artifact_id || item.id"
          class="resource-card"
        >
          <div class="card-cover" :class="getCoverClass(item.type)">
            <span class="tag">{{ item.type }}</span>
          </div>
          <div class="card-info">
            <h3 class="artifact-title">{{ item.title }}</h3>
            <p>{{ item.summary || '课程资源' }}</p>
            <div class="student-meta">
              <span>{{ item.chapter_title || '深度学习课程' }}</span>
              <span>建议 {{ item.suggested_minutes || 25 }} 分钟</span>
              <span>{{ qualityLabel(item) }}</span>
            </div>
            <button class="view-btn" type="button" @click="handleView(item)">开始学习</button>
          </div>
        </article>
      </div>
    </section>

    <el-dialog v-model="uploadVisible" title="贡献深度学习课程资源" width="420px" destroy-on-close>
      <el-form :model="uploadForm" label-width="82px">
        <el-form-item label="资源名称">
          <el-input v-model="uploadForm.title" placeholder="如：CNN卷积与池化实验讲义.pdf" />
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select v-model="uploadForm.type" placeholder="请选择资源类型" style="width: 100%;">
            <el-option label="课程讲解文档" value="课程讲解文档" />
            <el-option label="知识点思维导图" value="知识点思维导图" />
            <el-option label="练习题集" value="练习题集" />
            <el-option label="拓展阅读包" value="拓展阅读包" />
            <el-option label="PyTorch 实操案例" value="PyTorch 实操案例" />
            <el-option label="个性化视频观看指南" value="个性化视频观看指南" />
            <el-option label="交互动画规格" value="交互动画规格" />
            <el-option label="课程实践项目任务书" value="课程实践项目任务书" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源摘要">
          <el-input v-model="uploadForm.summary" placeholder="简要说明这份资源适合解决什么学习问题" />
        </el-form-item>
        <el-form-item label="知识来源">
          <el-input v-model="uploadForm.source" placeholder="如：深度学习第7章 CNN / PyTorch 官方文档 / 课堂讲义" />
        </el-form-item>
        <el-form-item label="资源正文">
          <el-input
            v-model="uploadForm.content"
            type="textarea"
            :rows="6"
            placeholder="支持 Markdown，可填写讲解、题集、代码实验、视频观看指南或项目任务书"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload">确认上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="typeApplyVisible" title="申请新资源分类" width="460px" destroy-on-close>
      <el-form :model="typeApplyForm" label-width="86px" label-position="left">
        <el-form-item label="分类名称">
          <el-input
            v-model="typeApplyForm.name"
            maxlength="20"
            show-word-limit
            placeholder="如：阶段性模拟试卷"
            @keyup.enter="submitNewTypeApplication"
          />
        </el-form-item>
        <el-form-item label="申请说明">
          <el-input
            v-model="typeApplyForm.reason"
            type="textarea"
            :rows="3"
            maxlength="80"
            show-word-limit
            placeholder="说明这个分类适合承载哪些学习资源"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeApplyVisible = false">取消</el-button>
        <el-button type="primary" :loading="typeApplyLoading" @click="submitNewTypeApplication">
          提交申请
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="学习资源详情" width="820px" destroy-on-close>
      <div v-if="selectedResource" class="resource-detail">
        <h3>{{ selectedResource.title }}</h3>
        <div class="detail-meta">
          <el-tag>{{ selectedResource.type }}</el-tag>
          <span>{{ selectedResource.chapter_title || selectedResource.source || '深度学习课程资料' }}</span>
          <span>{{ qualityLabel(selectedResource) }}</span>
        </div>
        <p class="summary">{{ selectedResource.summary || '暂无摘要' }}</p>
        <div class="artifact-detail-panel">
          <VideoRecommendationCard
            v-if="isVideoRecommendation(selectedResource)"
            :item="selectedArtifactPayload"
          />
          <PersonalizedVideoGuideCard
            v-else-if="isVideoGuide(selectedResource)"
            :guide="selectedArtifactPayload"
          />
          <InteractiveAnimationCard
            v-else-if="isInteractiveAnimation(selectedResource)"
            :artifact="selectedArtifactPayload"
          />
          <AnimationStoryboardCard
            v-else-if="isStoryboard(selectedResource)"
            :storyboard="selectedArtifactPayload"
          />
          <CodeLabCard
            v-else-if="isCodeLab(selectedResource)"
            :artifact="selectedArtifactPayload"
          />
          <ExerciseSetCard
            v-else-if="isExerciseSet(selectedResource)"
            :artifact="selectedArtifactPayload"
          />
          <PptExportCard
            v-else-if="isPptArtifact(selectedResource)"
            :artifact="selectedArtifactPayload"
          />
          <MarkdownRenderer v-else :content="selectedMarkdownContent" />
        </div>
      </div>
      <template #footer>
        <el-button v-if="selectedResource && !selectedResource.auto_pushed" @click="downloadPptx(selectedResource)">导出PPT</el-button>
        <el-button type="primary" @click="detailVisible = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import AnimationStoryboardCard from '@/components/AnimationStoryboardCard.vue'
import ChapterResourceHub from '@/components/ChapterResourceHub.vue'
import ChapterResourceSection from '@/components/ChapterResourceSection.vue'
import ChapterResourceSidebar from '@/components/ChapterResourceSidebar.vue'
import CodeLabCard from '@/components/CodeLabCard.vue'
import ExerciseSetCard from '@/components/ExerciseSetCard.vue'
import InteractiveAnimationCard from '@/components/InteractiveAnimationCard.vue'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'
import PersonalizedVideoGuideCard from '@/components/PersonalizedVideoGuideCard.vue'
import PptExportCard from '@/components/PptExportCard.vue'
import VideoRecommendationCard from '@/components/VideoRecommendationCard.vue'
import {
  getChapterResourceHubsAPI,
  getResourceArtifactsAPI,
  getPassedResourcesAPI,
  getRecommendedResourcesAPI,
  proposeTypeAPI,
  uploadResourceAPI
} from '@/api/resource'
import { useUserStore } from '@/stores/user'

const loading = ref(false)
const route = useRoute()
const userStore = useUserStore()
const RECOMMENDATION_LIMIT = 80
const modes = ['章节学习中心', '为你推荐', '全部资源']
const currentMode = ref('章节学习中心')
const searchKeyword = ref('')
const chapterHubs = ref([])
const selectedChapterId = ref('')
const rawResources = ref([])
const recommendedResources = ref([])
const recommendLoadFailed = ref(false)
const uploadVisible = ref(false)
const typeApplyVisible = ref(false)
const typeApplyLoading = ref(false)
const uploadForm = ref({ title: '', type: '', summary: '', source: '', content: '' })
const typeApplyForm = ref({ name: '', reason: '' })
const detailVisible = ref(false)
const selectedResource = ref(null)

const parseStructuredContent = (value) => {
  if (!value) return null
  if (typeof value === 'object') return value
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed || !['{', '['].includes(trimmed.charAt(0))) return null
  try {
    return JSON.parse(trimmed)
  } catch (error) {
    return null
  }
}

const normalizeArtifactResource = (resource = {}, artifact = {}) => {
  const metadata = resource.metadata || artifact.metadata || {}
  const content = artifact.content || resource.content || ''
  return {
    ...resource,
    ...artifact,
    metadata,
    id: resource.id || artifact.resource_id || artifact.artifact_id,
    resource_id: artifact.resource_id || resource.id || '',
    artifact_id: artifact.artifact_id || resource.artifact_id || '',
    unit_id: artifact.unit_id || resource.unit_id || (artifact.unit_ids || resource.unit_ids || [])[0] || '',
    unit_ids: artifact.unit_ids || resource.unit_ids || [],
    title: artifact.title || resource.title || '未命名资源',
    type: artifact.type || resource.type || '学习资源',
    summary: artifact.summary || resource.summary || '',
    source: artifact.source || resource.source || '',
    content,
    content_format: artifact.content_format || resource.content_format || '',
    quality_score: artifact.quality_score ?? resource.quality_score,
    risk_level: artifact.risk_level || resource.risk_level,
    chapter_id: resource.chapter_id || metadata.chapter_id || '',
    chapter_no: resource.chapter_no || metadata.chapter_no || '',
    chapter_title: resource.chapter_title || metadata.chapter_title || '',
    source_file: resource.source_file || metadata.source_file || '',
    suggested_minutes: resource.suggested_minutes || metadata.suggested_minutes || 25,
    quality_level: resource.quality_level || metadata.quality_level || '',
    teaching_quality_review: artifact.teaching_quality_review || resource.teaching_quality_review || {},
    personalization_reason: '',
    evidence_refs: artifact.evidence_refs || resource.evidence_refs || []
  }
}

const mergeResourcesWithArtifacts = (resources = [], artifacts = []) => {
  const artifactByResourceId = new Map()
  artifacts.forEach(artifact => {
    if (artifact.resource_id) artifactByResourceId.set(artifact.resource_id, artifact)
  })
  const seenResourceIds = new Set()
  const merged = resources.map(resource => {
    seenResourceIds.add(resource.id)
    return normalizeArtifactResource(resource, artifactByResourceId.get(resource.id) || {})
  })
  const standaloneArtifacts = artifacts
    .filter(artifact => !artifact.resource_id || !seenResourceIds.has(artifact.resource_id))
    .map(artifact => normalizeArtifactResource({}, artifact))
  return [...merged, ...standaloneArtifacts]
}

const fetchData = async () => {
  loading.value = true
  try {
    const [chapterRes, res, artifactRes, recommendRes] = await Promise.all([
      getChapterResourceHubsAPI(),
      getPassedResourcesAPI(),
      getResourceArtifactsAPI({ username: userStore.username || '', status: 'published', limit: 200 }),
      getRecommendedResourcesAPI(userStore.username || 'student', RECOMMENDATION_LIMIT)
    ])
    chapterHubs.value = chapterRes?.code === 200 ? chapterRes.data || [] : []
    if (!selectedChapterId.value && chapterHubs.value.length) {
      selectedChapterId.value = chapterHubs.value[0].chapter_id
    }
    const artifacts = artifactRes?.code === 200 ? artifactRes.data || [] : []
    rawResources.value = res?.code === 200 ? mergeResourcesWithArtifacts(res.data || [], artifacts) : []
    if (recommendRes?.code === 200) {
      recommendedResources.value = recommendRes.data || []
      recommendLoadFailed.value = false
    } else {
      recommendedResources.value = []
      recommendLoadFailed.value = true
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('资源数据加载失败')
  } finally {
    loading.value = false
  }
}

const selectedHub = computed(() => chapterHubs.value.find(item => item.chapter_id === selectedChapterId.value) || chapterHubs.value[0] || null)
const nextHub = computed(() => {
  if (!selectedHub.value) return null
  const index = chapterHubs.value.findIndex(item => item.chapter_id === selectedHub.value.chapter_id)
  return index >= 0 ? chapterHubs.value[index + 1] || null : null
})

const flatResources = computed(() => currentMode.value === '为你推荐' ? recommendedResources.value : rawResources.value)

const searchableText = (item = {}) => [
  item.title,
  item.type,
  item.summary,
  item.source,
  item.content,
  item.chapter_title,
  item.source_file,
  item.resource?.title,
  item.resource?.summary,
  item.resource?.content
].join('\n').toLowerCase()

const filteredFlatResources = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  return flatResources.value.filter(item => !keyword || searchableText(item).includes(keyword))
})

const groupedSearchResults = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return []
  return chapterHubs.value
    .map(hub => {
      const resources = [
        ...(hub.primary_resources || []),
        ...(hub.optional_resources || [])
      ].filter(item => searchableText({ ...item, chapter_title: hub.chapter_title }).includes(keyword))
      return { ...hub, items: resources }
    })
    .filter(group => group.items.length > 0)
})

const resultCountText = computed(() => {
  if (currentMode.value === '章节学习中心') {
    if (searchKeyword.value.trim()) {
      const total = groupedSearchResults.value.reduce((sum, group) => sum + group.items.length, 0)
      return `搜索命中 ${groupedSearchResults.value.length} 个章节 · ${total} 份资源`
    }
    return `课程共 ${chapterHubs.value.length} 章 · 精选 ${rawResources.value.filter(item => item.display_in_chapter_hub).length || rawResources.value.length} 份资源`
  }
  if (currentMode.value === '为你推荐') {
    return `已筛选 ${filteredFlatResources.value.length} / 推荐 ${recommendedResources.value.length} 份`
  }
  return `已筛选 ${filteredFlatResources.value.length} / ${rawResources.value.length} 份`
})

const emptyDescription = computed(() => {
  if (searchKeyword.value) return '没有匹配到资源，换个关键词试试'
  if (currentMode.value === '为你推荐' && recommendLoadFailed.value) return '个性化推荐加载失败，请检查后端推荐服务'
  return '暂无可展示资源'
})

const selectedStructuredContent = computed(() => parseStructuredContent(selectedResource.value?.content))
const selectedArtifactPayload = computed(() => {
  const resource = selectedResource.value || {}
  const structured = selectedStructuredContent.value
  if (Array.isArray(structured)) return { ...resource, items: structured }
  return { ...resource, ...(structured && typeof structured === 'object' ? structured : {}) }
})
const selectedMarkdownContent = computed(() => selectedResource.value?.content || '暂无正文内容')

const typeText = (item = {}) => `${item.type || ''} ${item.content_format || ''}`.toLowerCase()
const isVideoRecommendation = (item) => typeText(item).includes('视频推荐') || typeText(item).includes('video_recommendation')
const isVideoGuide = (item) => typeText(item).includes('观看指南') || typeText(item).includes('personalized_video_guide')
const isInteractiveAnimation = (item) => typeText(item).includes('交互动画') || typeText(item).includes('animation_spec')
const isStoryboard = (item) => typeText(item).includes('动画分镜') || typeText(item).includes('animation_storyboard')
const isCodeLab = (item) => typeText(item).includes('pytorch') || typeText(item).includes('代码实验') || typeText(item).includes('code_lab')
const isExerciseSet = (item) => typeText(item).includes('练习题') || typeText(item).includes('exercise_set')
const isPptArtifact = (item) => typeText(item).includes('ppt') || typeText(item).includes('pptx')

const qualityLabel = (item = {}) => {
  const review = item.teaching_quality_review || {}
  if (review.passed || review.status === 'passed') return '适合本章学习'
  if (item.quality_level === 'curated') return '课程精选资源'
  return '待补充完善'
}

const getCoverClass = (type = '') => {
  if (type.includes('导图')) return 'mindmap-cover'
  if (type.includes('文档')) return 'doc-cover'
  if (type.includes('诊断') || type.includes('反馈')) return 'feedback-cover'
  if (type.includes('实践') || type.includes('项目') || type.includes('PyTorch') || type.includes('代码')) return 'practice-cover'
  if (type.includes('视频') || type.includes('观看')) return 'video-cover'
  if (type.includes('动画') || type.includes('分镜')) return 'animation-cover'
  if (type.includes('PPT')) return 'ppt-cover'
  return 'generic-cover'
}

const handleView = (item) => {
  if (!item) return
  const targetId = item.id || item.resource_id || item.artifact_id
  selectedResource.value = rawResources.value.find(resource => resource.id === targetId || resource.artifact_id === targetId) || item
  detailVisible.value = true
}

const openUploadDialog = () => {
  uploadForm.value = { title: '', type: '', summary: '', source: '', content: '' }
  uploadVisible.value = true
}

const submitUpload = async () => {
  if (!uploadForm.value.title.trim() || !uploadForm.value.type) {
    return ElMessage.warning('请将资源名称和类型填写完整')
  }
  try {
    const res = await uploadResourceAPI({ ...uploadForm.value, username: userStore.username })
    if (res?.code === 200) {
      ElMessage.success('上传成功，资源将进入教师审核流程。')
      uploadVisible.value = false
    }
  } catch (error) {
    console.error('上传失败:', error)
  }
}

const handleProposeNewType = () => {
  typeApplyForm.value = { name: '', reason: '' }
  typeApplyVisible.value = true
}

const submitNewTypeApplication = async () => {
  const newTypeName = typeApplyForm.value.name.trim()
  if (!newTypeName) return ElMessage.warning('请填写资源分类名称')
  typeApplyLoading.value = true
  try {
    const res = await proposeTypeAPI(newTypeName, userStore.username, typeApplyForm.value.reason.trim())
    if (res?.code === 200) {
      ElMessage.success('申请已提交后台。')
      typeApplyVisible.value = false
    }
  } catch (error) {
    console.error('申请新分类失败:', error)
  } finally {
    typeApplyLoading.value = false
  }
}

const applyRouteQuery = async () => {
  const artifactId = String(route.query.artifact_id || '')
  const chapterId = String(route.query.chapter_id || '')
  if (chapterId) {
    currentMode.value = '章节学习中心'
    selectedChapterId.value = chapterId
  }
  if (artifactId) {
    currentMode.value = '全部资源'
    await nextTick()
    const item = rawResources.value.find(resource => String(resource.artifact_id || resource.id || '') === artifactId)
    if (item) handleView(item)
  }
}

const downloadPptx = (item) => {
  if (item?.artifact_id) {
    window.open(`/api/resource/artifacts/${encodeURIComponent(item.artifact_id)}/export/pptx`, '_blank')
    return
  }
  if (!item?.id) return
  window.open(`/api/resource/export/pptx/${encodeURIComponent(item.id)}`, '_blank')
}

onMounted(async () => {
  await fetchData()
  await applyRouteQuery()
})

watch(
  () => route.query,
  () => applyRouteQuery(),
  { deep: true }
)
</script>

<style scoped>
.resource-page {
  padding: 20px;
  min-height: 100%;
  background: #f7f8fa;
  box-sizing: border-box;
  overflow-y: auto;
}
.resource-topbar {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  margin-bottom: 18px;
}
.course-label {
  display: inline-block;
  color: #2563eb;
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 6px;
}
.resource-topbar h1 {
  margin: 0;
  font-size: 26px;
  color: #111827;
  line-height: 1.25;
}
.mode-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.mode-tabs button {
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #4b5563;
  border-radius: 999px;
  padding: 8px 16px;
  cursor: pointer;
}
.mode-tabs button.active {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}
.resource-toolbar {
  display: grid;
  grid-template-columns: minmax(260px, 520px) auto 1fr;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}
.result-count {
  color: #6b7280;
  font-size: 13px;
  white-space: nowrap;
}
.upload-action-bar {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
}
.chapter-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 260px;
  gap: 16px;
  align-items: start;
}
.chapter-main {
  min-width: 0;
}
.chapter-aside {
  display: grid;
  gap: 12px;
}
.aside-card {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  padding: 14px;
}
.aside-card strong {
  display: block;
  margin-bottom: 8px;
  color: #111827;
}
.aside-card p {
  color: #4b5563;
  line-height: 1.7;
  margin: 0;
}
.aside-card button {
  border: 0;
  border-radius: 8px;
  background: #eff6ff;
  color: #1677ff;
  padding: 8px 10px;
  text-align: left;
  cursor: pointer;
  line-height: 1.45;
}
.search-results {
  display: grid;
  gap: 16px;
}
.search-results h2 {
  margin: 0;
  color: #111827;
}
.search-group {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
}
.search-group h3 {
  margin: 0 0 4px;
  color: #111827;
}
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}
.resource-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.card-cover {
  min-height: 92px;
  padding: 12px;
}
.tag {
  display: inline-flex;
  padding: 5px 9px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.88);
  color: #374151;
  font-size: 12px;
  font-weight: 700;
}
.mindmap-cover { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
.doc-cover { background: linear-gradient(135deg, #ffd194 0%, #70e1f5 100%); }
.feedback-cover { background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); }
.practice-cover { background: linear-gradient(135deg, #fddb92 0%, #d1fdff 100%); }
.video-cover { background: linear-gradient(135deg, #fecdd3 0%, #bae6fd 100%); }
.animation-cover { background: linear-gradient(135deg, #ddd6fe 0%, #bbf7d0 100%); }
.ppt-cover { background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%); }
.generic-cover { background: linear-gradient(135deg, #e5e7eb 0%, #f9fafb 100%); }
.card-info {
  padding: 16px;
  display: grid;
  gap: 10px;
}
.artifact-title,
.card-info h3,
.resource-detail h3 {
  margin: 0;
  color: #111827;
  font-size: 17px;
  line-height: 1.45;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  display: block;
  max-height: none;
  word-break: break-word;
}
.card-info p {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}
.student-meta,
.detail-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.student-meta span,
.detail-meta span {
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
}
.view-btn {
  justify-self: start;
  border: 0;
  border-radius: 8px;
  padding: 9px 14px;
  background: #1890ff;
  color: #fff;
  cursor: pointer;
}
.resource-detail {
  display: grid;
  gap: 12px;
}
.summary {
  color: #4b5563;
  line-height: 1.7;
  margin: 0;
}
.artifact-detail-panel {
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
}
@media (max-width: 1100px) {
  .chapter-layout {
    grid-template-columns: 1fr;
  }
  .chapter-aside {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .resource-topbar,
  .resource-toolbar {
    grid-template-columns: 1fr;
    display: grid;
  }
  .upload-action-bar,
  .mode-tabs {
    justify-content: flex-start;
  }
  .chapter-aside {
    grid-template-columns: 1fr;
  }
}
</style>
