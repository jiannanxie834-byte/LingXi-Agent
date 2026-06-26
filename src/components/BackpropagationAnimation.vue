<template>
  <div class="flow-animation">
    <div class="nodes">
      <span v-for="node in nodes" :key="node" :class="{ active: node === currentHighlight }">{{ node }}</span>
    </div>
    <p>{{ currentStep.explanation }}</p>
    <button @click="next">播放下一步</button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ spec: { type: Object, default: () => ({}) } })
const index = ref(0)
const nodes = computed(() => props.spec.layers || ['input', 'hidden', 'output', 'loss'])
const steps = computed(() => props.spec.steps || [])
const currentStep = computed(() => steps.value[index.value] || { highlight: 'loss', explanation: '梯度从损失函数向前层传播。' })
const currentHighlight = computed(() => currentStep.value.highlight?.split('_')[0] || 'loss')
const next = () => { index.value = steps.value.length ? (index.value + 1) % steps.value.length : 0 }
</script>

<style scoped>
.flow-animation { display: grid; gap: 10px; }
.nodes { display: flex; gap: 8px; align-items: center; }
.nodes span { padding: 8px 12px; border-radius: 999px; background: #f3f4f6; color: #374151; }
.nodes span.active { background: #dcfce7; color: #15803d; font-weight: 700; }
p { margin: 0; color: #374151; }
button { justify-self: start; border: none; background: #16a34a; color: #fff; border-radius: 8px; padding: 6px 10px; }
</style>
