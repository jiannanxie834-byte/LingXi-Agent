<template>
  <div v-if="!isHiddenDsaAnimation" class="artifact-card">
    <div class="artifact-head">
      <div>
        <strong>{{ artifact.title || '未命名 Artifact' }}</strong>
        <p>{{ artifact.summary || '暂无摘要' }}</p>
      </div>
      <span>{{ artifact.type || '学习资源' }}</span>
    </div>

    <div class="artifact-body">
      <VideoRecommendationCard
        v-if="isVideoRecommendation"
        :item="payload"
      />
      <PersonalizedVideoGuideCard
        v-else-if="isVideoGuide"
        :guide="payload"
      />
      <InteractiveAnimationCard
        v-else-if="isInteractiveAnimation"
        :artifact="payload"
      />
      <CodeLabCard
        v-else-if="isCodeLab"
        :artifact="payload"
      />
      <ExerciseSetCard
        v-else-if="isExerciseSet"
        :artifact="payload"
      />
      <PptExportCard
        v-else-if="isPptArtifact"
        :artifact="payload"
      />
      <MarkdownRenderer
        v-else
        :content="publicContent"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CodeLabCard from '@/components/CodeLabCard.vue'
import ExerciseSetCard from '@/components/ExerciseSetCard.vue'
import InteractiveAnimationCard from '@/components/InteractiveAnimationCard.vue'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'
import PersonalizedVideoGuideCard from '@/components/PersonalizedVideoGuideCard.vue'
import PptExportCard from '@/components/PptExportCard.vue'
import VideoRecommendationCard from '@/components/VideoRecommendationCard.vue'

const props = defineProps({
  artifact: { type: Object, default: () => ({}) }
})

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

const INTERNAL_KEY_PATTERN = /^(artifact_id|resource_id|course_id|chapter_id|section_id|unit_id|unit_ids|evidence_refs|quality_score|risk_level|safety_review|teaching_quality_review|evidence_review|agent_name|agent_trace_id|source|status)$/i
const INTERNAL_TEXT_PATTERN = /\b(dsa_[a-z0-9_]+|sec_[a-z0-9_]+|unit_ids?|link_only|pending_curation|artifact_id|resource_id|course_id|chapter_id|section_id)\b/gi

const stripInternalText = (value) => {
  const text = String(value || '').replace(INTERNAL_TEXT_PATTERN, '').replace(/\n{3,}/g, '\n\n').trim()
  return text || '该类资源暂未完善'
}

const stripInternalObject = (value) => {
  if (Array.isArray(value)) return value.map(stripInternalObject)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !INTERNAL_KEY_PATTERN.test(key))
        .map(([key, item]) => [key, stripInternalObject(item)])
    )
  }
  if (typeof value === 'string') return stripInternalText(value)
  return value
}

const structuredContent = computed(() => parseStructuredContent(props.artifact.content))
const publicContent = computed(() => stripInternalText(props.artifact.content || props.artifact.summary || ''))
const payload = computed(() => ({
  ...stripInternalObject(props.artifact),
  ...(structuredContent.value && typeof structuredContent.value === 'object' ? stripInternalObject(structuredContent.value) : {}),
  content: publicContent.value
}))

const typeText = computed(() => `${props.artifact.type || ''} ${props.artifact.content_format || ''}`.toLowerCase())
const courseText = computed(() => `${props.artifact.course_id || props.artifact.metadata?.course_id || props.artifact.dsa_course_map?.course_id || ''}`)
const isDsaAnimationArtifact = computed(() => {
  const text = `${typeText.value} ${props.artifact.resource_key || ''} ${props.artifact.source_file || ''}`.toLowerCase()
  return courseText.value === 'data_structures_algorithms'
    && (text.includes('算法可视化') || text.includes('交互动画') || text.includes('animation_spec') || text.includes('animation'))
})
const isHiddenDsaAnimation = computed(() => isDsaAnimationArtifact.value)
const isVideoRecommendation = computed(() => typeText.value.includes('视频推荐') || typeText.value.includes('video_recommendation'))
const isVideoGuide = computed(() => typeText.value.includes('观看指南') || typeText.value.includes('personalized_video_guide'))
const isInteractiveAnimation = computed(() => !isDsaAnimationArtifact.value && (typeText.value.includes('算法可视化') || typeText.value.includes('交互动画') || typeText.value.includes('animation_spec')))
const isCodeLab = computed(() => typeText.value.includes('代码实验') || typeText.value.includes('code_lab'))
const isExerciseSet = computed(() => typeText.value.includes('练习题') || typeText.value.includes('exercise_set'))
const isPptArtifact = computed(() => typeText.value.includes('ppt') || typeText.value.includes('pptx'))
</script>

<style scoped>
.artifact-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
  display: grid;
  gap: 12px;
}
.artifact-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.artifact-head strong {
  color: #111827;
}
.artifact-head p {
  margin: 6px 0 0;
  color: #4b5563;
  line-height: 1.6;
}
.artifact-head span {
  flex: 0 0 auto;
  color: #2563eb;
  font-size: 12px;
}
.artifact-body {
  display: grid;
  gap: 10px;
}
</style>
