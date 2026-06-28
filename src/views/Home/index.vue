<template>
  <div class="home">
    <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-content">
        <button class="new-chat" :disabled="isSending" @click="startNewChat">
          + 新对话
        </button>

        <div class="history">
          <div
            v-if="chatSessions.length === 0"
            class="history-empty"
          >
            暂无历史对话
          </div>

          <div
            v-for="session in chatSessions"
            :key="session.id"
            class="history-item"
            :class="{ active: activeSessionId === session.id }"
          >
            <div class="history-main" @click="loadSessionMessages(session)">
              <span class="history-title">{{ session.title || '新对话' }}</span>
              <span class="history-time">{{ formatSessionTime(session.updated_at || session.created_at) }}</span>
            </div>
            <button
              class="history-delete-btn"
              title="删除对话"
              :disabled="isSending"
              @click.stop="deleteSession(session)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-area">
      <div class="chat-sidebar-toggle">
        <button class="toggle-btn" @click="toggleSidebar">

          <svg
            v-if="isCollapsed"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          >
            <line x1="21" y1="12" x2="9" y2="12"></line>
            <polyline points="15 18 21 12 15 6"></polyline>
            <line x1="3" y1="6" x2="3" y2="18"></line>
          </svg>

          <svg
            v-else
            viewBox="0 0 24 24"
            width="18"
            height="18"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          >
            <line x1="3" y1="12" x2="15" y2="12"></line>
            <polyline points="9 18 3 12 9 6"></polyline>
            <line x1="21" y1="6" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 消息区域 -->
      <div class="messages">

        <ChatMessage
          v-for="(msg, index) in messageList"
          :key="msg.localId || msg.id || index"
          :message="msg"
          @delete="deleteMessage"
        />

      </div>

      <!-- 输入区域 -->
      <div class="input-area">

        <div class="input-wrapper">

          <input
            v-model="inputText"
            @keyup.enter="sendMessage"
            :disabled="isSending"
            placeholder="请输入学习问题，按 Enter 发送..."
          />

          <button
            class="send-btn"
            :disabled="isSending"
            @click="sendMessage"
          >
            {{ isSending ? '生成中' : '发送' }}
          </button>

        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import ChatMessage from '@/components/ChatWindow/ChatMessage.vue'
import {
  deleteChatMessageAPI,
  deleteChatSessionAPI,
  getChatMessagesAPI,
  getChatSessionsAPI,
  normalizeStudentChatData,
  sendChatMessageAPI
} from '@/api/chat'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// =========================
// 状态
// =========================
const isCollapsed = ref(false)

const inputText = ref('')

const isSending = ref(false)

const chatSessions = ref([])

const activeSessionId = ref('')

const welcomeMessage = {
  role: 'ai',
  isIntro: true,
  content:
    '你好，我是灵析学伴。你可以围绕《数据结构与算法》课程直接提问，例如复杂度分析、二分查找、BFS、动态规划或迷宫寻路项目，或让我生成讲解、题集、代码任务、视频观看指南和项目路线。'
}

const messageList = ref([{ ...welcomeMessage }])

const currentUsername = () => userStore.username || 'student'

const activeSessionStorageKey = () => `lingxi_active_chat_${currentUsername()}`

const createPendingProgress = () => [
  { key: 'understand', label: '理解需求', status: 'running' },
  { key: 'collect', label: '整理资料', status: 'pending' },
  { key: 'profile', label: '更新画像', status: 'pending' },
  { key: 'answer', label: '生成建议', status: 'pending' },
  { key: 'plan', label: '生成路线', status: 'pending' },
  { key: 'resources', label: '整理资源', status: 'pending' },
  { key: 'check', label: '完成检查', status: 'pending' }
]

let progressTimer = null

const clearProgressTimer = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const startProgressSimulation = (aiMsg) => {
  clearProgressTimer()
  let activeIndex = 0
  progressTimer = setInterval(() => {
    const steps = aiMsg.progress || []
    if (!steps.length || activeIndex >= steps.length - 1) {
      return
    }
    steps[activeIndex].status = 'completed'
    activeIndex += 1
    steps[activeIndex].status = 'running'
  }, 850)
}

const completePendingSteps = (steps = []) => {
  return steps.map(step => ({
    ...step,
    status: step.status === 'pending' || step.status === 'running' ? 'completed' : step.status
  }))
}

// =========================
// 侧边栏
// =========================
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const formatSessionTime = (value) => {
  if (!value) return ''
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit'
  })
}

const resetMessages = () => {
  messageList.value = [{ ...welcomeMessage }]
}

const refreshChatSessions = async () => {
  const res = await getChatSessionsAPI(currentUsername())
  if (res && res.code === 200) {
    chatSessions.value = res.data || []
  }
}

const startNewChat = () => {
  if (isSending.value) return
  activeSessionId.value = ''
  sessionStorage.removeItem(activeSessionStorageKey())
  resetMessages()
  scrollToBottom()
}

const loadSessionMessages = async (session) => {
  if (isSending.value) {
    ElMessage.warning('当前消息生成中，请稍后再切换对话')
    return
  }
  if (!session?.id) return

  try {
    activeSessionId.value = session.id
    sessionStorage.setItem(activeSessionStorageKey(), session.id)

    const res = await getChatMessagesAPI(session.id, currentUsername())
    if (res && res.code === 200) {
      const messages = (res.data || []).map(item => {
        const normalized = normalizeStudentChatData({ data: item })
        return {
          id: item.id,
          localId: item.id,
          role: item.role === 'user' ? 'user' : 'ai',
          content: item.role === 'user' ? item.content || '' : normalized.content,
          contentType: normalized.contentType,
          routeType: normalized.routeType,
          progress: normalized.progress,
          cards: normalized.cards,
          traceId: normalized.traceId,
          isPending: false
        }
      })
      messageList.value = messages.length ? messages : [{ ...welcomeMessage }]
      await scrollToBottom()
    }
  } catch (error) {
    console.error('加载历史对话失败:', error)
    ElMessage.error('历史对话加载失败')
  }
}

const deleteSession = async (session) => {
  if (!session?.id || isSending.value) return
  try {
    await ElMessageBox.confirm(
      '确定删除该对话及其全部消息吗？',
      '删除对话',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const res = await deleteChatSessionAPI(session.id, currentUsername())
    if (res && res.code === 200) {
      chatSessions.value = chatSessions.value.filter(item => item.id !== session.id)
      if (activeSessionId.value === session.id) {
        activeSessionId.value = ''
        sessionStorage.removeItem(activeSessionStorageKey())
        resetMessages()
        await scrollToBottom()
      }
      ElMessage.success('对话已删除')
    } else {
      ElMessage.error(res?.message || '删除对话失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除对话失败:', error)
    }
  }
}

const deleteMessage = async (msg) => {
  if (!msg || msg.isIntro || isSending.value) return
  try {
    if (msg.id) {
      const res = await deleteChatMessageAPI(msg.id, currentUsername())
      if (!res || res.code !== 200) {
        return ElMessage.error(res?.message || '删除消息失败')
      }
    }
    messageList.value = messageList.value.filter(item => item !== msg && item.id !== msg.id)
    if (!messageList.value.length) {
      resetMessages()
    }
    ElMessage.success('消息已删除')
  } catch (error) {
    console.error('删除消息失败:', error)
    ElMessage.error('删除消息失败')
  }
}

const restoreLastSession = async () => {
  try {
    await refreshChatSessions()

    const savedSessionId = sessionStorage.getItem(activeSessionStorageKey())
    const savedSession = chatSessions.value.find(item => item.id === savedSessionId)
    const defaultSession = savedSession || chatSessions.value[0]

    if (defaultSession) {
      await loadSessionMessages(defaultSession)
    }
  } catch (error) {
    console.error('恢复对话失败:', error)
  }
}

// =========================
// 滚动到底部
// =========================
const scrollToBottom = async () => {

  await nextTick()

  const container = document.querySelector('.messages')

  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// =========================
// 发送消息
// =========================
const sendMessage = async () => {

  // 空消息不发送
  if (!inputText.value.trim()) return

  // 正在发送时不允许重复发
  if (isSending.value) return

  const userText = inputText.value.trim()

  // =========================
  // 1. 添加用户消息
  // =========================
  const userMsg = reactive({
    localId: `local_user_${Date.now()}`,
    role: 'user',
    content: userText
  })
  messageList.value.push(userMsg)

  // 清空输入框
  inputText.value = ''

  // 锁定发送
  isSending.value = true

  await scrollToBottom()

  // =========================
  // 2. 添加 AI 占位消息
  // =========================
  const aiMsg = reactive({
    localId: `local_ai_${Date.now()}`,
    role: 'ai',
    content: '正在整理学习建议...',
    contentType: 'student_answer',
    routeType: '',
    progress: createPendingProgress(),
    cards: [],
    isPending: true
  })

  messageList.value.push(aiMsg)
  startProgressSimulation(aiMsg)

  await scrollToBottom()

  try {

    // =========================
    // 3. 请求后端
    // =========================
    const res = await sendChatMessageAPI({
      username: userStore.username || 'student',
      session_id: activeSessionId.value,
      message: userText
    })

    // =========================
    // 4. 提取 AI 回复
    // =========================
    const resultData = normalizeStudentChatData(res)
    const reply = resultData.content

    if (!reply) {
      throw new Error('AI未返回有效内容')
    }

    // =========================
    // 5. 替换“思考中...”
    // =========================
    aiMsg.content = reply
    aiMsg.contentType = resultData.contentType || 'student_answer'
    aiMsg.routeType = resultData.routeType || ''
    aiMsg.progress = resultData.progress && resultData.progress.length
      ? resultData.progress
      : []
    aiMsg.cards = resultData.cards || []
    aiMsg.traceId = resultData.traceId || ''
    aiMsg.isPending = false
    if (resultData.messageId) {
      aiMsg.id = resultData.messageId
    }
    if (resultData.userMessageId) {
      userMsg.id = resultData.userMessageId
    }

    if (resultData.sessionId) {
      activeSessionId.value = resultData.sessionId
      sessionStorage.setItem(activeSessionStorageKey(), resultData.sessionId)
    }

    if (resultData.session) {
      const nextSessions = chatSessions.value.filter(item => item.id !== resultData.session.id)
      chatSessions.value = [resultData.session, ...nextSessions]
    } else {
      await refreshChatSessions()
    }

    // =========================
    // 6. 更新画像
    // =========================
    const profile =
      resultData.profile ||
      res?.data?.data?.profile ||
      res?.data?.profile

    if (profile) {
      userStore.updateLearningProfile(profile)
      window.dispatchEvent(new CustomEvent('lingxi-profile-updated', {
        detail: profile
      }))
    }

  } catch (error) {

    console.error('AI请求失败:', error)

    aiMsg.content = error?.message || '后端服务异常，请稍后再试'
    aiMsg.isPending = false
    aiMsg.isError = true
    aiMsg.progress = (aiMsg.progress || []).map(step => ({
      ...step,
      status: step.status === 'running' ? 'failed' : step.status
    }))

    ElMessage.error('AI请求失败')

  } finally {

    clearProgressTimer()

    // 解锁
    isSending.value = false

    await scrollToBottom()
  }
}

onMounted(() => {
  restoreLastSession()
})
</script>

<style scoped>
.home {
  height: 100%;
  display: flex;
  overflow: hidden;
  background-color: #fff;
}

/* ================= 左侧侧边栏 ================= */
.sidebar {
  width: 240px;
  background-color: #f7f7f8;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 0;
}

.sidebar-content {
  width: 240px;
  padding: 14px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.new-chat {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.new-chat:hover {
  background: #f0f0f0;
}

.history {
  margin-top: 12px;
  flex: 1;
  overflow-y: auto;
}

.history-empty {
  padding: 12px;
  color: #999;
  font-size: 13px;
}

.history-item {
  padding: 9px 8px 9px 10px;
  border-radius: 8px;
  margin-bottom: 6px;
  color: #333;
  font-size: 14px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-item:hover {
  background: #ececec;
}

.history-item.active {
  background: #e6f4ff;
  color: #1677ff;
}

.history-main {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 4px;
  cursor: pointer;
}

.history-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.history-time {
  font-size: 12px;
  color: #999;
}

.history-item.active .history-time {
  color: #4096ff;
}

.history-delete-btn {
  opacity: 0;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  flex-shrink: 0;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
}

.history-item:hover .history-delete-btn {
  opacity: 1;
}

.history-delete-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* ================= 右侧聊天区 ================= */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background-color: #ffffff;
  position: relative;
}

.chat-sidebar-toggle {
  position: absolute;
  top: 10px;
  left: 14px;
  z-index: 3;
  display: flex;
  align-items: center;
}

.toggle-btn {
  cursor: pointer;
  padding: 6px;
  border: none;
  background: transparent;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s;
}

.toggle-btn:hover {
  background: #f5f5f5;
}

/* 消息区 */
.messages {
  flex: 1;
  padding: 24px 32px 120px;
  overflow-y: auto;
  scroll-behavior: smooth;
  min-height: 0;
}

/* 输入区 */
.input-area {
  padding: 10px 24px 12px;
  background: #fff;
  flex-shrink: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f4f4f4;
  border-radius: 22px;
  padding: 6px 6px 6px 18px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.input-wrapper input {
  flex: 1;
  height: 36px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
}

.send-btn {
  margin-left: 8px;
  width: 74px;
  height: 36px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.send-btn:hover {
  background: #40a9ff;
}
</style>
