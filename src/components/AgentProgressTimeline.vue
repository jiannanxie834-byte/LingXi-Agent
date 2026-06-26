<template>
  <div class="agent-progress">
    <div class="progress-head">
      <strong>Agent 进度</strong>
      <span>{{ completedCount }}/{{ steps.length || 0 }}</span>
    </div>
    <div class="steps">
      <div
        v-for="step in normalizedSteps"
        :key="step.key || step.label"
        class="step"
        :class="step.status"
      >
        <span class="dot"></span>
        <div>
          <strong>{{ step.label }}</strong>
          <small>{{ step.agent || step.detail || statusText(step.status) }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  steps: { type: Array, default: () => [] }
})

const fallbackSteps = [
  { key: 'intent', label: '识别学习需求', status: 'pending', agent: 'IntentSemanticAgent' },
  { key: 'profile', label: '更新学生画像', status: 'pending', agent: 'ProfileAgent' },
  { key: 'course', label: '匹配课程图谱', status: 'pending', agent: 'CourseMapAgent' },
  { key: 'resource', label: '规划资源 Artifact', status: 'pending', agent: 'ResourcePlanningAgent' }
]

const normalizedSteps = computed(() => props.steps?.length ? props.steps : fallbackSteps)
const completedCount = computed(() => normalizedSteps.value.filter(item => item.status === 'completed').length)

const statusText = (status) => {
  if (status === 'running') return '进行中'
  if (status === 'completed') return '已完成'
  if (status === 'failed') return '失败'
  if (status === 'skipped') return '跳过'
  return '等待中'
}
</script>

<style scoped>
.agent-progress {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}
.progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.progress-head span {
  color: #6b7280;
  font-size: 12px;
}
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(145px, 1fr));
  gap: 8px;
}
.step {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  min-width: 0;
  color: #6b7280;
}
.dot {
  width: 9px;
  height: 9px;
  margin-top: 5px;
  border-radius: 50%;
  background: #cbd5e1;
  flex: 0 0 auto;
}
.step.completed .dot { background: #16a34a; }
.step.running .dot { background: #2563eb; }
.step.failed .dot { background: #dc2626; }
.step strong {
  display: block;
  font-size: 13px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.step small {
  display: block;
  font-size: 11px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
