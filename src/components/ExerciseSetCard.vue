<template>
  <div class="exercise-card">
    <strong>{{ artifact.title || '练习题集' }}</strong>
    <MarkdownRenderer :content="artifact.content || artifact.summary || ''" />
  </div>
</template>

<script setup>
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'
defineProps({ artifact: { type: Object, default: () => ({}) } })
</script>

<style scoped>
.exercise-card { border: 1px solid #fed7aa; border-radius: 10px; padding: 12px; background: #fffaf3; }
</style>
