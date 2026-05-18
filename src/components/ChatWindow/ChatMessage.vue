<template>
  <div class="message-wrapper" :class="{ 'is-user': isUser }">
    
    <div class="avatar">
      {{ isUser ? '我' : 'AI' }}
    </div>

    <div class="bubble">
      <div v-if="isUser" class="user-text">
        {{ message.content }}
      </div>
      
      <MarkdownRenderer v-else :content="message.content" />
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
</style>