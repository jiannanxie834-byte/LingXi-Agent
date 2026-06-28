<template><AlgorithmAnimationPlaceholder :spec="animation_spec" fallback-title="树遍历动画" /></template>
<script setup>
import AlgorithmAnimationPlaceholder from './AlgorithmAnimationPlaceholder.vue'
defineProps({ animation_spec: { type: Object, default: () => ({}) } })
</script>
