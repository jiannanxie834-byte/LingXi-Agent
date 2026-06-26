<template>
  <div class="animation-box">
    <div class="matrix">
      <span
        v-for="cell in cells"
        :key="cell.key"
        :class="{ active: activeSet.has(cell.key) }"
      >{{ cell.value }}</span>
    </div>
    <p>{{ currentStep.explanation || '卷积核在输入矩阵上滑动，逐步生成输出特征图。' }}</p>
    <button @click="next">下一步</button>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  spec: { type: Object, default: () => ({}) }
})

const stepIndex = ref(0)
const size = computed(() => props.spec.input_matrix_size?.[0] || 5)
const steps = computed(() => props.spec.steps || [])
const currentStep = computed(() => steps.value[stepIndex.value] || {})
const activeSet = computed(() => new Set((currentStep.value.highlight_input_region || []).map(([r, c]) => `${r}-${c}`)))
const cells = computed(() => Array.from({ length: size.value * size.value }, (_, index) => {
  const r = Math.floor(index / size.value)
  const c = index % size.value
  return { key: `${r}-${c}`, value: index + 1 }
}))
const next = () => {
  stepIndex.value = steps.value.length ? (stepIndex.value + 1) % steps.value.length : 0
}
</script>

<style scoped>
.animation-box { display: grid; gap: 10px; }
.matrix { display: grid; grid-template-columns: repeat(5, 34px); gap: 5px; }
.matrix span { height: 34px; display: grid; place-items: center; border-radius: 6px; background: #f3f4f6; }
.matrix span.active { background: #bfdbfe; color: #1d4ed8; font-weight: 700; }
p { margin: 0; color: #374151; }
button { justify-self: start; border: none; background: #2563eb; color: #fff; border-radius: 8px; padding: 6px 10px; }
</style>
