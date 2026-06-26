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
        <div v-if="statusText" class="status-line" :class="{ pending: message.isPending, error: message.isError }">
          <span class="status-dot"></span>
          <span>{{ statusText }}</span>
        </div>

        <MarkdownRenderer :content="message.content" />

        <div v-if="productCards.length" class="result-cards">
          <button
            v-for="card in productCards"
            :key="card.id"
            type="button"
            class="result-card"
            :class="{ clickable: card.actionRoute }"
            @click="handleCardClick(card)"
          >
            <div class="card-head">
              <strong>{{ card.title }}</strong>
              <span>{{ card.badge }}</span>
            </div>
            <p>{{ card.summary }}</p>
            <div v-if="card.items && card.items.length" class="card-items">
              <div v-for="item in card.items" :key="`${item.type}-${item.title}`" class="card-item">
                <strong>{{ item.title }}</strong>
                <span>{{ item.type }} · {{ item.status || '待审核' }}</span>
                <em v-if="item.summary">{{ item.summary }}</em>
              </div>
            </div>
            <em v-if="card.actionText">{{ card.actionText }}</em>
          </button>
        </div>

        <div v-if="showAgentTrace && traceSteps.length" class="trace-strip">
          <div
            v-for="step in traceSteps"
            :key="step.key || step.label"
            class="trace-step"
            :class="`status-${step.status || 'completed'}`"
          >
            <span class="trace-dot"></span>
            <span>{{ step.label }}</span>
          </div>
        </div>
      </template>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'
import { LEARNING_ROUTE_TYPES, PLAIN_ROUTE_TYPES, SHOW_AGENT_TRACE } from '@/api/chat'

// 接收父组件（首页）传过来的消息对象
const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const router = useRouter()

// 计算属性：判断这条消息是不是用户发的
const isUser = computed(() => props.message.role === 'user')

const showAgentTrace = SHOW_AGENT_TRACE

const routeType = computed(() => props.message.routeType || props.message.route_type || '')
const isPlainRoute = computed(() => {
  return PLAIN_ROUTE_TYPES.has(routeType.value) || props.message.contentType === 'conversation_reply'
})
const canShowLearningStatus = computed(() => {
  return LEARNING_ROUTE_TYPES.has(routeType.value) || (!routeType.value && !isPlainRoute.value)
})

const statusLabel = (status) => {
  const map = {
    ready: '已生成',
    pending_review: '待审核',
    pending: '进行中',
    completed: '已完成',
    failed: '失败',
    requires_review: '需复核'
  }
  return map[status] || status || '已完成'
}

const statusText = computed(() => {
  if (isUser.value) return ''
  if (props.message.isIntro) return ''
  if (props.message.isError) return '生成失败，请稍后重试'
  if (props.message.isPending) return '正在整理学习建议'
  if (!canShowLearningStatus.value) return ''
  if ((props.message.cards || []).some(card => card.type === 'resource_review')) {
    return '学习建议已生成，配套资源正在教师审核'
  }
  return props.message.content ? '学习建议已生成' : ''
})

const traceSteps = computed(() => {
  if (!showAgentTrace || !canShowLearningStatus.value) return []
  return (props.message.progress || []).filter(step => step?.label)
})

const productCards = computed(() => {
  if (!canShowLearningStatus.value) return []
  const cards = props.message.cards || []
  const result = []

  cards.forEach((card, index) => {
    if (card.type === 'learning_path') {
      result.push({
        id: `path-${index}-${card.title}`,
        title: '学习路线已生成',
        badge: statusLabel(card.status || 'ready'),
        summary: card.summary || '已为你整理出可执行的学习步骤，可进入规划页继续查看。',
        actionText: card.action_text || '查看规划',
        actionRoute: card.action_route || '/plan',
        items: []
      })
      return
    }

    if (card.type === 'resource_review') {
      result.push({
        id: `resource-pending-${index}-${card.title}`,
        title: card.title || '配套资源正在教师审核',
        badge: statusLabel(card.status || 'pending_review'),
        summary: card.summary || '配套 Artifact 已生成，正在进行教师审核。审核通过后会进入资源工厂。',
        actionText: card.action_text || '审核通过后查看资源工厂',
        actionRoute: card.action_route || '/resource',
        items: (card.items || []).slice(0, 4)
      })
      result.push({
        id: `resource-review-${index}-${card.title}`,
        title: '审核通过后进入资源工厂',
        badge: '待发布',
        summary: '当前只展示标题、类型和摘要。完整正文会在教师审核通过后开放。',
        actionText: card.action_text || '审核通过后查看资源工厂',
        actionRoute: card.action_route || '/resource',
        items: []
      })
      return
    }

    result.push({
      id: `card-${index}-${card.title}`,
      title: card.title || '学习内容已准备',
      badge: statusLabel(card.status),
      summary: card.summary || '',
      actionText: card.action_text || '',
      actionRoute: card.action_route || '',
      items: card.items || []
    })
  })

  return result
})

const handleCardClick = (card) => {
  if (card?.actionRoute) {
    router.push(card.actionRoute)
  }
}
</script>

<style scoped>
/* 消息整体外层，使用 flex 布局 */
.message-wrapper {
  display: flex;
  margin-bottom: 14px;
  gap: 12px;
}

/* 🌟 核心：如果是用户消息，反转 flex 方向，让头像和气泡靠右！ */
.is-user {
  flex-direction: row-reverse;
}

/* 头像样式 */
.avatar {
  width: 32px;
  height: 32px;
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
  max-width: 86%;
  padding: 10px 14px;
  border-radius: 10px;
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

.status-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #16a34a;
  flex-shrink: 0;
}

.status-line.pending .status-dot {
  background: #1677ff;
  box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.1);
}

.status-line.error .status-dot {
  background: #dc2626;
}

.result-cards {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.result-card {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #f8fbff;
  text-align: left;
  color: #1f2937;
}

.result-card.clickable {
  cursor: pointer;
}

.result-card.clickable:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-head strong {
  font-size: 13px;
  line-height: 1.4;
}

.card-head span {
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 11px;
}

.result-card p {
  margin: 6px 0 0;
  color: #4b5563;
  font-size: 12px;
  line-height: 1.55;
}

.card-items {
  display: grid;
  gap: 6px;
  margin-top: 8px;
}

.card-item {
  display: grid;
  gap: 2px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e5e7eb;
}

.card-item strong {
  color: #1f2937;
  font-size: 12px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-item span {
  color: #64748b;
  font-size: 11px;
  line-height: 1.4;
}

.result-card .card-item em {
  margin-top: 0;
  color: #64748b;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.45;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.result-card em {
  display: inline-block;
  margin-top: 8px;
  color: #1677ff;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
}

.trace-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #eef2f7;
}

.trace-step {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 7px;
  border-radius: 999px;
  background: #f8fafc;
  color: #64748b;
  font-size: 11px;
}

.trace-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #16a34a;
}

.status-running .trace-dot {
  background: #1677ff;
}

.status-pending .trace-dot,
.status-skipped .trace-dot {
  background: #cbd5e1;
}

.status-failed .trace-dot {
  background: #dc2626;
}

.status-requires_review .trace-dot {
  background: #f59e0b;
}
</style>
