<template>
  <aside class="chapter-sidebar">
    <button
      v-for="chapter in chapters"
      :key="chapter.chapter_id"
      type="button"
      class="chapter-nav-item"
      :class="{ active: chapter.chapter_id === selectedChapterId }"
      @click="$emit('select', chapter.chapter_id)"
    >
      <span>第 {{ chapter.chapter_no }} 章</span>
      <strong>{{ shortTitle(chapter.chapter_title) }}</strong>
    </button>
  </aside>
</template>

<script setup>
defineProps({
  chapters: { type: Array, default: () => [] },
  selectedChapterId: { type: String, default: '' }
})

defineEmits(['select'])

const shortTitle = (title = '') => String(title).replace(/^第\s*\d+\s*章\s*/, '')
</script>

<style scoped>
.chapter-sidebar {
  display: grid;
  gap: 8px;
  align-content: start;
}
.chapter-nav-item {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, color 0.18s;
}
.chapter-nav-item span {
  display: block;
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 4px;
}
.chapter-nav-item strong {
  display: block;
  color: #111827;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 700;
}
.chapter-nav-item:hover,
.chapter-nav-item.active {
  border-color: #1890ff;
  background: #eff6ff;
}
.chapter-nav-item.active strong,
.chapter-nav-item.active span {
  color: #1677ff;
}
</style>
