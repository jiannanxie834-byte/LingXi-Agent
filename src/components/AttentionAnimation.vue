<template>
  <div class="attention-animation">
    <div class="tokens">
      <span v-for="token in tokens" :key="token">{{ token }}</span>
    </div>
    <div class="stage">{{ currentStep.highlight }}</div>
    <p>{{ currentStep.explanation }}</p>
    <button @click="next">播放下一步</button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
const props = defineProps({ spec: { type: Object, default: () => ({}) } })
const index = ref(0)
const tokens = computed(() => props.spec.tokens || ['Q', 'K', 'V'])
const steps = computed(() => props.spec.steps || [])
const currentStep = computed(() => steps.value[index.value] || { highlight: 'attention', explanation: '计算注意力权重并加权求和。' })
const next = () => { index.value = steps.value.length ? (index.value + 1) % steps.value.length : 0 }
</script>

<style scoped>
.attention-animation { display: grid; gap: 10px; }
.tokens { display: flex; gap: 8px; }
.tokens span { padding: 8px 12px; border-radius: 8px; background: #ede9fe; color: #5b21b6; font-weight: 700; }
.stage { width: fit-content; padding: 6px 10px; border-radius: 999px; background: #fef3c7; color: #92400e; }
p { margin: 0; color: #374151; }
button { justify-self: start; border: none; background: #7c3aed; color: #fff; border-radius: 8px; padding: 6px 10px; }
</style>
