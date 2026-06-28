<template><AlgorithmAnimationPlaceholder :spec="animation_spec" fallback-title="并查集动画" /></template>
<script setup>
import AlgorithmAnimationPlaceholder from './AlgorithmAnimationPlaceholder.vue'
defineProps({ animation_spec: { type: Object, default: () => ({}) } })
</script>
