<template><AlgorithmAnimationPlaceholder :spec="animation_spec" fallback-title="回溯搜索树动画" /></template>
<script setup>
import AlgorithmAnimationPlaceholder from './AlgorithmAnimationPlaceholder.vue'
defineProps({ animation_spec: { type: Object, default: () => ({}) } })
</script>
