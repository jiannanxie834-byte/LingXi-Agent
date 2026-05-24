<template>
  <div class="home">
    <div class="sidebar" :class="{ 'collapsed': isCollapsed }">
      <div class="sidebar-content">
        <button class="new-chat">
          + 新对话
        </button>
        <div class="history">
          <div class="history-item">
            Vue学习
          </div>
          <div class="history-item">
            JavaScript复习
          </div>
        </div>
      </div>
    </div>
    <div class="chat-area">
      <div class="chat-header">
        <button class="toggle-btn" @click="toggleSidebar">
          <svg v-if="isCollapsed" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="21" y1="12" x2="9" y2="12"></line><polyline points="15 18 21 12 15 6"></polyline><line x1="3" y1="6" x2="3" y2="18"></line></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="3" y1="12" x2="15" y2="12"></line><polyline points="9 18 3 12 9 6"></polyline><line x1="21" y1="6" x2="21" y2="18"></line></svg>
        </button>
        <span class="header-title">当前对话：多智能体学习助手</span>
      </div>
      <div class="messages">
        <ChatMessage 
          v-for="(msg, index) in messageList" 
          :key="index" 
          :message="msg" 
        />
      </div>
      <div class="input-area">
        <div class="input-wrapper">
          <input 
            v-model="inputText"
            @keyup.enter="sendMessage"
            :disabled="isSending"
            placeholder="请输入学习问题，按 Enter 发送..." 
          />
          <button class="send-btn" :disabled="isSending" @click="sendMessage">
            {{ isSending ? '生成中' : '发送' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import ChatMessage from '@/components/ChatWindow/ChatMessage.vue' 
import { sendChatMessageAPI } from '@/api/chat'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 控制侧边栏收缩状态
const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 绑定的输入框内容
const inputText = ref('')

const messageList = ref([
  {
    role: 'ai',
    content: '你好，我是灵析多智能体学习助手。你可以直接问课程问题、让系统生成练习题、规划学习路线，或要求给出学科实践应用任务。'
  }
])
const isSending = ref(false)

// 发送消息
const sendMessage = async () => {
  // 如果输入为空（或者全是空格），直接拦截，不发送
  if (!inputText.value.trim() || isSending.value) return

  // 1. 把用户的消息推入数组
  const userText = inputText.value
  messageList.value.push({
    role: 'user',
    content: userText
  })

  // 2. 清空输入框
  inputText.value = ''

  // 3. 页面更新后，自动滚动到底部
  await scrollToBottom()

  isSending.value = true
  const aiMessage = {
    role: 'ai',
    content: '多智能体正在协作：画像分析、知识检索、资源生成、路径规划正在依次运行...'
  }
  messageList.value.push(aiMessage)
  await scrollToBottom()

  try {
    const history = messageList.value
      .filter(item => item.content !== aiMessage.content)
      .slice(-8)
    const res = await sendChatMessageAPI({
      username: userStore.username || 'student',
      message: userText,
      history
    })

    if (res && res.code === 200) {
      aiMessage.content = res.data.reply
      userStore.updateLearningProfile(res.data.profile)
    }
  } catch (error) {
    console.error('多智能体对话失败:', error)
    aiMessage.content = '多智能体服务暂时没有响应，请确认后端服务已经启动后再试。'
    ElMessage.error('对话服务请求失败')
  } finally {
    isSending.value = false
    await scrollToBottom()
  }
}

// 自动滚动到底部的方法
const scrollToBottom = async () => {
  // nextTick 会等待 DOM 更新完毕后再执行后面的代码
  await nextTick() 
  const container = document.querySelector('.messages')
  if (container) {
    // 把滚动条的顶部位置，设置成整个容器的内部总高度（也就是直接滚到底）
    container.scrollTop = container.scrollHeight
  }
}
</script>

<style scoped>
.home {
  height: 100%;
  display: flex;
  overflow: hidden; 
  background-color: #fff;
}

/* ================= 左侧侧边栏样式 ================= */
.sidebar {
  width: 260px;
  background-color: #f7f7f8; 
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
  overflow: hidden; 
  flex-shrink: 0;
}
.sidebar.collapsed {
  width: 0;
}
.sidebar-content {
  width: 260px; 
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.new-chat {
  width: 100%;
  height: 44px;
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
  margin-top: 20px;
  flex: 1;
  overflow-y: auto;
}
.history-item {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  color: #333;
  font-size: 14px;
  transition: background 0.2s;
}
.history-item:hover {
  background: #ececec;
}

/* ================= 右侧聊天区样式 ================= */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; 
  background-color: #ffffff;
}

/* 顶部工具栏 */
.chat-header {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}
.toggle-btn {
  cursor: pointer;
  padding: 8px;
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
.header-title {
  margin-left: 12px;
  font-weight: 500;
  color: #333;
}

/* 消息列表区 */
.messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto; 
  scroll-behavior: smooth;
}

/* 底部输入区 */
.input-area {
  padding: 20px 24px;
  background: #fff;
  border-top: 1px solid transparent; /* 留出空间，不画实线更现代 */
}
.input-wrapper {
  display: flex;
  align-items: center;
  background: #f4f4f4;
  border-radius: 24px;
  padding: 8px 8px 8px 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.input-wrapper input {
  flex: 1;
  height: 40px;
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
}
.send-btn {
  margin-left: 10px;
  width: 80px;
  height: 40px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 20px;
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
