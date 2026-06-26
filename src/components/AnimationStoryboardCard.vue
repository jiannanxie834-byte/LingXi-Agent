<template>
  <div class="storyboard-card">
    <strong>{{ storyboard.title || '动画分镜' }}</strong>
    <div v-for="scene in scenes" :key="scene.scene_id" class="scene">
      <span>镜头 {{ scene.scene_id }}</span>
      <p>{{ scene.visual }}</p>
      <small>{{ scene.narration || scene.subtitle }}</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ storyboard: { type: Object, default: () => ({}) } })
const scenes = computed(() => props.storyboard.scenes || [])
</script>

<style scoped>
.storyboard-card { border: 1px solid #f5d0fe; background: #fdf4ff; border-radius: 10px; padding: 12px; }
.scene { margin-top: 10px; padding-top: 10px; border-top: 1px solid #f5d0fe; }
.scene span { color: #a21caf; font-weight: 700; font-size: 12px; }
p { margin: 4px 0; color: #374151; }
small { color: #6b7280; }
</style>
