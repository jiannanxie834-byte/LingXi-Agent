<template><AlgorithmAnimationPlaceholder :spec="animation_spec" fallback-title="动态规划表格动画" /></template>
<script setup>
import AlgorithmAnimationPlaceholder from './AlgorithmAnimationPlaceholder.vue'
defineProps({ animation_spec: { type: Object, default: () => ({}) } })
</script>
