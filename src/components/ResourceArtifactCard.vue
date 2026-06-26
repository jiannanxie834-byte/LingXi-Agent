<template>
  <div class="artifact-card">
    <div class="artifact-head">
      <strong>{{ artifact.title }}</strong>
      <span>{{ artifact.type }}</span>
    </div>
    <p>{{ artifact.summary || '暂无摘要' }}</p>
    <div class="meta">
      <span>质量分 {{ artifact.quality_score || artifact.safety_review?.score || '待评估' }}</span>
      <span>{{ artifact.risk_level || artifact.safety_review?.risk_level || artifact.status }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  artifact: { type: Object, default: () => ({}) }
})
</script>

<style scoped>
.artifact-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}
.artifact-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.artifact-head span {
  flex: 0 0 auto;
  color: #2563eb;
  font-size: 12px;
}
p { margin: 0; color: #4b5563; line-height: 1.6; }
.meta {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.meta span {
  padding: 4px 7px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
}
</style>
