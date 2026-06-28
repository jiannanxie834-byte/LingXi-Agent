<template>
  <div class="algorithm-animation">
    <div class="animation-stage">
      <strong>{{ title }}</strong>
      <p>此处将渲染算法动画</p>
    </div>
    <ol class="step-list">
      <li v-for="(step, index) in steps" :key="index">
        <span>{{ step.label || `步骤 ${index + 1}` }}</span>
        <p>{{ step.explanation || step.description || step }}</p>
      </li>
    </ol>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  spec: { type: Object, default: () => ({}) },
  fallbackTitle: { type: String, default: '算法可视化动画' }
})

const title = computed(() => props.spec.title || props.fallbackTitle)
const steps = computed(() => {
  const raw = props.spec.steps || []
  return raw.length ? raw : [
    { label: '初始化', explanation: '准备输入数据和状态变量。' },
    { label: '执行算法', explanation: '逐步展示比较、移动、入栈、出队、松弛或状态转移。' },
    { label: '复盘结果', explanation: '查看输出、复杂度和常见错误。' }
  ]
})
</script>

<style scoped>
.algorithm-animation {
  display: grid;
  gap: 12px;
}
.animation-stage {
  min-height: 150px;
  border: 1px dashed #93c5fd;
  border-radius: 8px;
  background: #f8fbff;
  display: grid;
  place-items: center;
  text-align: center;
  color: #1f2937;
}
.animation-stage p {
  margin: 4px 0 0;
  color: #667085;
}
.step-list {
  margin: 0;
  padding-left: 22px;
  display: grid;
  gap: 8px;
}
.step-list span {
  font-weight: 700;
}
.step-list p {
  margin: 2px 0 0;
  color: #667085;
}
</style>
