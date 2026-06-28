<template><AlgorithmAnimationPlaceholder :spec="animation_spec" fallback-title="KMP 前缀函数动画" /></template>
<script setup>
import AlgorithmAnimationPlaceholder from './AlgorithmAnimationPlaceholder.vue'
defineProps({ animation_spec: { type: Object, default: () => ({}) } })
</script>
