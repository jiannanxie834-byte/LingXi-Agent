<template>
  <div class="code-lab-card">
    <strong>{{ title }}</strong>
    <MarkdownRenderer :content="content" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'
const props = defineProps({ artifact: { type: Object, default: () => ({}) } })
const title = computed(() => props.artifact.title || '代码实验')
const content = computed(() => props.artifact.content || '')
</script>

<style scoped>
.code-lab-card { border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; background: #f7fef9; }
</style>
