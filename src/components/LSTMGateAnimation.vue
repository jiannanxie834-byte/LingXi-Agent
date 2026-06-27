<template>
  <div class="lstm-animation">
    <div class="state-lane">
      <div
        v-for="node in nodes"
        :key="node"
        class="state-node"
        :class="{ active: activeSet.has(node) }"
      >
        {{ node }}
      </div>
    </div>

    <div class="formula-box">
      <span>Step {{ currentStep.step || index + 1 }}</span>
      <strong>{{ currentStep.formula || 'c_t = f_t * c_{t-1} + i_t * g_t' }}</strong>
    </div>

    <p>{{ currentStep.explanation || 'LSTM 通过遗忘门、输入门和输出门控制记忆的保留、写入和读取。' }}</p>

    <div class="controls">
      <button @click="prev">上一步</button>
      <button @click="next">下一步</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  spec: { type: Object, default: () => ({}) }
})

const index = ref(0)
const nodes = computed(() => props.spec.nodes || ['x_t', 'h_{t-1}', 'c_{t-1}', 'f_t', 'i_t', 'g_t', 'c_t', 'o_t', 'h_t'])
const steps = computed(() => props.spec.steps || [])
const currentStep = computed(() => steps.value[index.value] || {})
const activeSet = computed(() => new Set(currentStep.value.highlight || []))

const next = () => {
  index.value = steps.value.length ? (index.value + 1) % steps.value.length : 0
}

const prev = () => {
  if (!steps.value.length) return
  index.value = (index.value - 1 + steps.value.length) % steps.value.length
}
</script>

<style scoped>
.lstm-animation {
  display: grid;
  gap: 12px;
}
.state-lane {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(74px, 1fr));
  gap: 8px;
}
.state-node {
  min-height: 44px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
}
.state-node.active {
  border-color: #0ea5e9;
  background: #e0f2fe;
  color: #0369a1;
}
.formula-box {
  display: grid;
  gap: 4px;
  padding: 10px;
  border-radius: 8px;
  background: #f1f5f9;
}
.formula-box span {
  color: #64748b;
  font-size: 12px;
}
.formula-box strong {
  color: #0f172a;
  word-break: break-word;
}
p {
  margin: 0;
  color: #374151;
  line-height: 1.7;
}
.controls {
  display: flex;
  gap: 8px;
}
button {
  border: none;
  background: #0284c7;
  color: #fff;
  border-radius: 8px;
  padding: 6px 10px;
}
</style>
