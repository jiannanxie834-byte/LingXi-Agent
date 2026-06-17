<template>
  <div class="message-wrapper" :class="{ 'is-user': isUser }">
    
    <div class="avatar">
      {{ isUser ? '我' : 'AI' }}
    </div>

    <div class="bubble">
      <div v-if="isUser" class="user-text">
        {{ message.content }}
      </div>

      <template v-else>
        <div v-if="message.progressSteps && message.progressSteps.length" class="agent-progress">
          <div class="progress-title">多智能体处理链路</div>
          <div
            v-for="step in message.progressSteps"
            :key="step.key || step.label"
            class="progress-step"
            :class="`status-${step.status || 'completed'}`"
          >
            <span class="step-dot"></span>
            <div class="step-main">
              <div class="step-label">{{ step.label }}</div>
              <div class="step-detail">
                {{ step.agent || 'Agent' }}<span v-if="step.detail"> · {{ step.detail }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="message.safetySummary && message.safetySummary.total" class="safety-summary">
          <span>内容自检</span>
          <strong>{{ message.safetySummary.risk_level }}</strong>
          <em>{{ message.safetySummary.total }} 份资源 · 平均 {{ message.safetySummary.avg_score }} 分</em>
        </div>

        <div v-if="message.evidence && message.evidence.length" class="evidence-panel">
          <div class="evidence-title">知识库依据</div>
          <div
            v-for="item in message.evidence"
            :key="`${item.kind || 'evidence'}-${item.resource_id || item.title}`"
            class="evidence-item"
          >
            <div class="evidence-head">
              <span class="evidence-name">{{ item.title }}</span>
              <span class="evidence-kind">{{ evidenceKindLabel(item) }}</span>
            </div>
            <div class="evidence-source">{{ item.source || '课程知识库' }}</div>
            <div class="evidence-excerpt">{{ item.excerpt }}</div>
          </div>
        </div>

        <MarkdownRenderer :content="message.content" />
      </template>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'

// 接收父组件（首页）传过来的消息对象
const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

// 计算属性：判断这条消息是不是用户发的
const isUser = computed(() => props.message.role === 'user')

const evidenceKindLabel = (item) => {
  if (item.resource_type) return item.resource_type
  return item.kind === 'resource' ? '已审核资源' : '课程知识点'
}
</script>

<style scoped>
/* 消息整体外层，使用 flex 布局 */
.message-wrapper {
  display: flex;
  margin-bottom: 24px;
  gap: 16px;
}

/* 🌟 核心：如果是用户消息，反转 flex 方向，让头像和气泡靠右！ */
.is-user {
  flex-direction: row-reverse;
}

/* 头像样式 */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f2f5;
  color: #666;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0; /* 防止头像被挤压 */
}
.is-user .avatar {
  background-color: #e6f7ff;
  color: #1890ff;
}
.is-ai .avatar {
  background-color: #f7f7f8;
  border: 1px solid #eee;
}

/* 气泡外壳样式 */
.bubble {
  max-width: 75%; /* 限制气泡最大宽度，防止霸屏 */
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

/* AI 气泡的特定样式 */
.message-wrapper:not(.is-user) .bubble {
  background-color: #ffffff;
  border: 1px solid #e8e8e8;
  border-top-left-radius: 2px; /* 左上角直角，更像对话 */
}

/* 用户气泡的特定样式（经典的蓝色气泡） */
.is-user .bubble {
  background-color: #1890ff;
  color: white;
  border-top-right-radius: 2px; /* 右上角直角 */
}

/* 用户文本排版，保留用户的换行，并在长单词时自动换行 */
.user-text {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
  font-size: 15px;
}

.agent-progress {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.progress-title {
  margin-bottom: 8px;
  color: #1f2937;
  font-size: 13px;
  font-weight: 700;
}

.progress-step {
  display: flex;
  gap: 8px;
  padding: 7px 0;
}

.step-dot {
  width: 9px;
  height: 9px;
  margin-top: 5px;
  border-radius: 50%;
  background: #16a34a;
  flex-shrink: 0;
}

.status-running .step-dot {
  background: #1677ff;
  box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.12);
}

.status-pending .step-dot {
  background: #cbd5e1;
}

.status-skipped .step-dot {
  background: #cbd5e1;
}

.status-fallback .step-dot {
  background: #f59e0b;
}

.step-main {
  min-width: 0;
}

.step-label {
  color: #111827;
  font-size: 13px;
  line-height: 1.4;
  font-weight: 600;
}

.step-detail {
  margin-top: 2px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.45;
  word-break: break-word;
}

.safety-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 10px;
  border-radius: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  font-size: 12px;
}

.safety-summary strong {
  font-size: 12px;
}

.safety-summary em {
  color: #4b5563;
  font-style: normal;
}

.evidence-panel {
  margin-bottom: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #fffaf0;
  border: 1px solid #fed7aa;
}

.evidence-title {
  color: #92400e;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}

.evidence-item {
  padding: 9px 0;
  border-top: 1px solid rgba(251, 146, 60, 0.22);
}

.evidence-item:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.evidence-head {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  justify-content: space-between;
}

.evidence-name {
  min-width: 0;
  color: #1f2937;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
  word-break: break-word;
}

.evidence-kind {
  flex-shrink: 0;
  max-width: 120px;
  padding: 2px 6px;
  border-radius: 4px;
  background: #ffedd5;
  color: #9a3412;
  font-size: 11px;
  line-height: 1.4;
  text-align: center;
}

.evidence-source {
  margin-top: 3px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.45;
}

.evidence-excerpt {
  margin-top: 5px;
  color: #374151;
  font-size: 12px;
  line-height: 1.65;
  word-break: break-word;
}
</style>
