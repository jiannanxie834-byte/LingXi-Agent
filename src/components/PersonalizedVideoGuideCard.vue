<template>
  <div class="guide-card">
    <strong>{{ guide.topic || '个性化观看指南' }}</strong>
    <section v-for="block in blocks" :key="block.key">
      <span>{{ block.label }}</span>
      <ul>
        <li v-for="item in block.items" :key="item">{{ item }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  guide: { type: Object, default: () => ({}) }
})

const blocks = computed(() => [
  { key: 'before', label: '观看前', items: props.guide.before_watch || [] },
  { key: 'focus', label: '观看中', items: props.guide.watch_focus || [] },
  { key: 'think', label: '暂停思考', items: props.guide.pause_and_think || [] },
  { key: 'after', label: '观看后', items: props.guide.after_watch_tasks || [] }
].filter(block => block.items.length))
</script>

<style scoped>
.guide-card {
  border: 1px solid #e0e7ff;
  border-radius: 10px;
  padding: 12px;
  background: #f8f7ff;
}
section { margin-top: 8px; }
span { color: #4f46e5; font-size: 12px; font-weight: 700; }
ul { margin: 4px 0 0; padding-left: 18px; color: #374151; }
li { margin: 2px 0; }
</style>
