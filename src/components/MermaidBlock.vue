<template>
  <MarkdownRenderer :content="codeBlock" />
</template>

<script setup>
import { computed } from 'vue'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'
const props = defineProps({ code: { type: String, default: '' } })
const codeBlock = computed(() => `\`\`\`mermaid\n${props.code}\n\`\`\``)
</script>
