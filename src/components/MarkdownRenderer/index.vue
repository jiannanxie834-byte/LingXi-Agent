<template>
  <div ref="markdownRef" class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
// 🌟 引入极其极客的深色代码高亮主题
import 'highlight.js/styles/github-dark.css' 

// 接收父组件（聊天气泡）传进来的原始 Markdown 文本
const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const markdownRef = ref(null)

let mermaidInstance = null

const loadMermaid = async () => {
  if (!mermaidInstance) {
    const module = await import('mermaid')
    mermaidInstance = module.default
    mermaidInstance.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'default'
    })
  }
  return mermaidInstance
}

// 初始化 markdown-it 解析器
const md = new MarkdownIt({
  html: false,      // AI 输出只按 Markdown 渲染，避免注入不安全 HTML
  linkify: true,    // 自动将网址转换为可点击链接
  typographer: true,// 优化标点符号排版
  highlight: function (str, lang) {
    if ((lang || '').toLowerCase() === 'mermaid') {
      return `<div class="mermaid">${md.utils.escapeHtml(str)}</div>`
    }
    // 核心代码高亮逻辑
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
})

// 监听 content 的变化，自动重新渲染（完美适配后续的 AI 流式输出）
const renderedHtml = computed(() => {
  return md.render(props.content)
})

const renderMermaid = async () => {
  await nextTick()
  const nodes = markdownRef.value?.querySelectorAll('.mermaid')
  if (!nodes || !nodes.length) return
  try {
    const mermaid = await loadMermaid()
    await mermaid.run({ nodes })
  } catch (error) {
    console.warn('Mermaid 渲染失败:', error)
  }
}

watch(() => props.content, renderMermaid, { flush: 'post' })

onMounted(renderMermaid)
</script>

<style scoped>
/* 微信/Kimi 风格的排版基调 */
.markdown-body {
  font-size: 15px;
  line-height: 1.6;
  color: #1a202c;
  word-break: break-word;
}

/* 深度作用选择器，修改 v-html 生成的内部标签样式 */
:deep(p) {
  margin-bottom: 12px;
}
:deep(p:last-child) {
  margin-bottom: 0;
}
:deep(h1), :deep(h2), :deep(h3) {
  margin: 16px 0 12px;
  font-weight: 600;
  color: #2d3748;
}
:deep(ul), :deep(ol) {
  padding-left: 20px;
  margin-bottom: 12px;
}
:deep(pre) {
  padding: 12px;
  border-radius: 8px;
  margin: 12px 0;
  background-color: #0d1117; /* 匹配 github-dark 的背景色 */
  overflow-x: auto;
}
:deep(.mermaid) {
  margin: 14px 0;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  overflow-x: auto;
  text-align: center;
}
:deep(code) {
  font-family: 'Consolas', 'Monaco', 'Ubuntu Mono', monospace;
  font-size: 14px;
}
/* 对非代码块里的行内代码做特殊高亮 */
:deep(:not(pre) > code) {
  background-color: #f1f5f9;
  color: #e53e3e;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
