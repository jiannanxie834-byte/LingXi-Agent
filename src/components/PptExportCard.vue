<template>
  <div class="ppt-card">
    <div>
      <strong>{{ artifact.title || 'PPT 大纲' }}</strong>
      <p>可将当前 Artifact 导出为 PPTX 演示材料。</p>
    </div>
    <a :href="exportUrl" target="_blank" rel="noopener">导出 PPTX</a>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ artifact: { type: Object, default: () => ({}) } })
const exportUrl = computed(() => {
  const id = props.artifact.artifact_id || props.artifact.id
  return `/api/resource/artifacts/${id}/export/pptx`
})
</script>

<style scoped>
.ppt-card {
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 12px;
  background: #fff7f7;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
p { margin: 4px 0 0; color: #6b7280; }
a { align-self: center; color: #dc2626; font-weight: 700; white-space: nowrap; }
</style>
