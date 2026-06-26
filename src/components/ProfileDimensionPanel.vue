<template>
  <div class="profile-panel">
    <div class="panel-head">
      <strong>画像摘要</strong>
      <span>{{ dimensions.length }} 维</span>
    </div>
    <div class="dimension-list">
      <div v-for="item in dimensions" :key="item.label" class="dimension-item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  profile: { type: Object, default: () => ({}) }
})

const dimensions = computed(() => {
  const source = props.profile?.dimensions || {}
  return Object.entries(source).slice(0, 10).map(([label, value]) => ({ label, value }))
})
</script>

<style scoped>
.profile-panel {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.panel-head span {
  color: #6b7280;
  font-size: 12px;
}
.dimension-list {
  display: grid;
  gap: 6px;
}
.dimension-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
}
.dimension-item span {
  color: #6b7280;
}
.dimension-item strong {
  color: #111827;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
