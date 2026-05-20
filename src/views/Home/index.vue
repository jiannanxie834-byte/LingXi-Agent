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
        <span class="header-title">当前对话：Vue学习</span>
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
            placeholder="请输入学习问题，按 Enter 发送..." 
          />
          <button class="send-btn" @click="sendMessage">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ChatMessage from '@/components/ChatWindow/ChatMessage.vue' 

// 控制侧边栏收缩状态
const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

// 绑定的输入框内容
const inputText = ref('')

// 模拟聊天数据列表
const messageList = ref([
  {
    role: 'ai',
    content: '你好！我是灵析AI学习助手。请问今天想学习什么内容？'
  },
  {
    role: 'user',
    content: '帮我复习一下 Vue3 的响应式原理，顺便给个代码例子。'
  },
  {
    role: 'ai',
    content: `好的！根据你的知识图谱，下面为你生成 **Vue3 响应式原理** 的专属学习资料：

### 核心概念：Ref 的使用
在 Vue3 中，我们使用 \`ref\` 来定义响应式数据，这比 Vue2 的 Option API 灵活得多。

\`\`\`javascript
import { ref } from 'vue'

// 定义一个响应式计数器
const count = ref(0)

// 增加计数的方法
const increment = () => {
  count.value++ 
  console.log('当前数值:', count.value)
}
\`\`\`

**🔔 学习建议：**
1. 牢记在 \`<script>\` 中修改必须带上 \`.value\`
2. 结合你易错的生命周期知识点，建议课后去 **[资源]** 板块查看实操项目。`
  }
])

// 发送消息
const sendMessage = async () => {
  // 如果输入为空（或者全是空格），直接拦截，不发送
  if (!inputText.value.trim()) return

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

  // 4.  模拟 AI 延迟回复 (这里以后就是对接你赛题里的大模型 API 的地方)
  setTimeout(async () => {
    messageList.value.push({
      role: 'ai',
      content: `收到你的问题：**${userText}**。\n\n*多智能体系统正在分析你的学习画像，稍后这里将接入真实的流式大模型 API...*`
    })
    await scrollToBottom()
  }, 1000) // 延迟 1 秒假装在思考
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
.send-btn:hover {
  background: #40a9ff;
}
</style>