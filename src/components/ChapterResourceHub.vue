<template>
  <section v-if="hub" class="chapter-hub">
    <header class="hub-header">
      <div>
        <span class="chapter-kicker">章节学习中心</span>
        <h2>{{ hub.entry_title || hub.chapter_title }}</h2>
        <p>{{ hub.summary }}</p>
      </div>
    </header>

    <div class="goal-panel">
      <strong>本章学习目标</strong>
      <ul>
        <li v-for="goal in hub.learning_goals || []" :key="goal">{{ goal }}</li>
      </ul>
    </div>

    <div class="resource-block">
      <h3>必学资源</h3>
      <ChapterResourceSection
        v-for="item in visiblePrimaryResources"
        :key="item.source_file || item.resource_key"
        :item="item"
        :chapter-title="hub.chapter_title"
        @view="$emit('view', $event)"
      />
    </div>

    <div v-if="visibleOptionalResources.length" class="resource-block">
      <h3>扩展资源</h3>
      <ChapterResourceSection
        v-for="item in visibleOptionalResources"
        :key="item.source_file || item.resource_key"
        :item="item"
        :chapter-title="hub.chapter_title"
        @view="$emit('view', $event)"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import ChapterResourceSection from '@/components/ChapterResourceSection.vue'

const props = defineProps({
  hub: { type: Object, default: null }
})

defineEmits(['view'])

const isDsaAnimationItem = (item = {}) => {
  const courseId = props.hub?.course_id || props.hub?.manifest?.course_id || ''
  const text = `${item.type || ''} ${item.source_file || ''} ${item.resource_key || ''}`.toLowerCase()
  return courseId === 'data_structures_algorithms'
    && (text.includes('animation') || text.includes('算法可视化') || text.includes('交互动画'))
}

const visiblePrimaryResources = computed(() => (props.hub?.primary_resources || []).filter(item => !isDsaAnimationItem(item)))
const visibleOptionalResources = computed(() => (props.hub?.optional_resources || []).filter(item => !isDsaAnimationItem(item)))
</script>

<style scoped>
.chapter-hub {
  display: grid;
  gap: 18px;
}
.hub-header {
  padding: 22px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
}
.chapter-kicker {
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}
.hub-header h2 {
  margin: 8px 0 10px;
  color: #111827;
  font-size: 26px;
  line-height: 1.3;
  white-space: normal;
}
.hub-header p {
  margin: 0;
  color: #4b5563;
  line-height: 1.7;
}
.goal-panel,
.resource-block {
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.goal-panel strong,
.resource-block h3 {
  display: block;
  margin: 0 0 12px;
  color: #111827;
}
.goal-panel ul {
  margin: 0;
  padding-left: 20px;
  color: #4b5563;
  line-height: 1.8;
}
.resource-block {
  display: grid;
  gap: 12px;
}
</style>
