<template>
  <div class="video-card">
    <div class="card-head">
      <strong>{{ item.title }}</strong>
      <span>{{ item.platform || item.source || '公开视频' }}</span>
    </div>
    <p v-if="item.personalization_reason">{{ item.personalization_reason }}</p>
    <div class="segments" v-if="segments.length">
      <span v-for="seg in segments" :key="`${seg.start}-${seg.end}`">
        {{ seg.start }}-{{ seg.end }} · {{ seg.reason || seg.focus }}
      </span>
    </div>
    <a v-if="item.source_url" :href="item.source_url" target="_blank" rel="noopener">打开原始链接</a>
    <small>仅提供原始链接和学习建议，不复制、不下载、不重新分发视频内容。</small>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: { type: Object, default: () => ({}) }
})

const segments = computed(() => props.item.recommended_segments || props.item.segments || [])
</script>

<style scoped>
.video-card {
  border: 1px solid #dbeafe;
  border-radius: 10px;
  padding: 12px;
  background: #f8fbff;
}
.card-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.card-head strong { color: #111827; }
.card-head span, small { color: #64748b; }
p { margin: 6px 0; color: #374151; }
.segments { display: grid; gap: 4px; margin: 8px 0; }
.segments span { color: #1d4ed8; font-size: 12px; }
a { display: inline-flex; margin: 6px 0; color: #2563eb; font-weight: 700; }
small { display: block; font-size: 11px; }
</style>
