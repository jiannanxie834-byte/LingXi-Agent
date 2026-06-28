<template><AlgorithmAnimationPlaceholder :spec="animation_spec" fallback-title="BFS / DFS 图遍历动画" /></template>
<script setup>
import AlgorithmAnimationPlaceholder from './AlgorithmAnimationPlaceholder.vue'
defineProps({ animation_spec: { type: Object, default: () => ({}) } })
</script>
