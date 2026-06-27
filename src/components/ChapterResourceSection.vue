<template>
  <article class="chapter-resource-card" :class="{ unavailable: !item.available }">
    <div class="resource-main">
      <div class="resource-type">{{ item.type || '学习资源' }}</div>
      <h3 class="chapter-resource-title">{{ item.title }}</h3>
      <p>{{ description }}</p>
      <div class="resource-meta">
        <span>{{ chapterTitle }}</span>
        <span>建议 {{ suggestedMinutes }} 分钟</span>
        <span>{{ qualityText }}</span>
      </div>
    </div>
    <button type="button" :disabled="!item.available" @click="$emit('view', item.resource)">
      {{ item.available ? '开始学习' : '待补充' }}
    </button>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, default: () => ({}) },
  chapterTitle: { type: String, default: '' }
})

defineEmits(['view'])

const resource = computed(() => props.item.resource || {})
const description = computed(() => resource.value.summary || props.item.summary || '本章 curated 课程资源')
const suggestedMinutes = computed(() => resource.value.suggested_minutes || resource.value.suggestedMinutes || 25)
const qualityText = computed(() => {
  const review = resource.value.teaching_quality_review || {}
  if (review.passed || review.status === 'passed') return '已完成教学质量校验'
  if (resource.value.quality_level === 'curated') return '课程底座精选资源'
  return '待教师复核'
})
</script>

<style scoped>
.chapter-resource-card {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.chapter-resource-card.unavailable {
  background: #f9fafb;
}
.resource-main {
  min-width: 0;
}
.resource-type {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #2563eb;
  font-size: 12px;
  margin-bottom: 8px;
}
.chapter-resource-title {
  margin: 0;
  color: #111827;
  font-size: 17px;
  line-height: 1.45;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  word-break: break-word;
}
p {
  margin: 8px 0 0;
  color: #4b5563;
  line-height: 1.6;
}
.resource-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.resource-meta span {
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
}
button {
  align-self: center;
  border: 0;
  border-radius: 8px;
  padding: 9px 14px;
  background: #1890ff;
  color: #fff;
  cursor: pointer;
  flex: 0 0 auto;
}
button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
