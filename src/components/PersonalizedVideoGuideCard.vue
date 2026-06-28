<template>
  <div class="guide-card">
    <strong>{{ guide.topic || '个性化观看指南' }}</strong>
    <section v-for="block in blocks" :key="block.key">
      <span>{{ block.label }}</span>
      <ul>
        <li v-for="item in block.items" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section v-if="videos.length">
      <span>推荐视频</span>
      <article v-for="video in videos" :key="video.video_item_id || video.source_url || video.title" class="video-item">
        <strong>{{ video.title || '公开视频' }}</strong>
        <p v-if="video.watch_focus?.length">观看重点：{{ video.watch_focus.join('、') }}</p>
        <p v-if="video.before_watch?.length">观看前：{{ video.before_watch.join('；') }}</p>
        <p v-if="video.after_watch_tasks?.length">观看后：{{ video.after_watch_tasks.join('；') }}</p>
        <a
          v-if="video.source_url"
          :href="video.source_url"
          target="_blank"
          rel="noopener noreferrer"
        >
          打开原始链接
        </a>
      </article>
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

const videos = computed(() => Array.isArray(props.guide.recommended_videos) ? props.guide.recommended_videos : [])
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
.video-item {
  margin-top: 8px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
}
.video-item strong {
  display: block;
  color: #111827;
  margin-bottom: 4px;
}
.video-item p {
  margin: 4px 0;
  color: #4b5563;
  line-height: 1.5;
}
.video-item a {
  display: inline-flex;
  margin-top: 6px;
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}
</style>
