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

const MERMAID_START_RE = /^\s*(mindmap|flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|journey|gantt|pie|xychart-beta)\b/i

const isFencedMermaid = (text) => /```mermaid/i.test(text || '')

const MINDMAP_GROUPS = [
  {
    name: '前置知识',
    patterns: [/前置|基础|定义|概念|条件|复杂度|数组|链表|栈|队列|树|图|递归/]
  },
  {
    name: '核心结构',
    patterns: [/核心|结构|性质|关系|状态|指针|节点|存储|顺序|链式|最优子结构|贪心选择/]
  },
  {
    name: '操作流程',
    patterns: [/流程|步骤|操作|插入|删除|查找|遍历|访问|push|pop|peek|入队|出队|递归调用|转移|排序|匹配/]
  },
  {
    name: '典型应用',
    patterns: [/应用|场景|任务|项目|括号|表达式|调度|路径|Huffman|编码|Top|窗口|播放|缓存/]
  },
  {
    name: '易错点',
    patterns: [/误区|错误|混淆|忽略|边界|反例|陷阱|开销|成本|不一定|快慢|指针/]
  },
  {
    name: '练习方向',
    patterns: [/练习|题|证明|验证|对比|复盘|实验|代码|实现|下一步/]
  }
]

const groupMindmapNodes = (nodes) => {
  const groups = MINDMAP_GROUPS.map(group => ({ name: group.name, items: [] }))
  const fallback = { name: '核心概念', items: [] }
  const seen = new Set()

  nodes.forEach(rawItem => {
    const item = String(rawItem || '').trim()
    if (!item || seen.has(item)) return
    seen.add(item)
    const targetIndex = MINDMAP_GROUPS.findIndex(group => group.patterns.some(pattern => pattern.test(item)))
    if (targetIndex >= 0) {
      groups[targetIndex].items.push(item)
    } else {
      fallback.items.push(item)
    }
  })

  return [...groups, fallback]
    .map(group => ({
      ...group,
      items: group.items.slice(0, 6)
    }))
    .filter(group => group.items.length)
}

const rebuildGroupedMindmap = (root, nodes) => {
  const lines = ['mindmap', `  root${root}`]
  const groups = groupMindmapNodes(nodes)

  groups.forEach(group => {
    lines.push(`    ${group.name}`)
    group.items.forEach(item => {
      lines.push(`      ${item}`)
    })
  })

  return lines.join('\n')
}

const normalizeFlatMindmap = (text) => {
  const lines = (text || '')
    .split(/\r?\n/)
    .map(line => line.replace(/\t/g, '  ').trimEnd())
    .filter(line => line.trim())

  if (lines.length < 8 || !/^mindmap\b/i.test(lines[0].trim())) {
    return text
  }

  const rootIndex = lines.findIndex(line => /^\s*root(\(\(|\(|\[|\{)?/i.test(line.trim()))
  if (rootIndex < 0) {
    return text
  }

  const root = lines[rootIndex].trim().replace(/^root/i, '').trim()
  const childLines = lines.slice(rootIndex + 1)
  const isFlat = childLines.length >= 8 && childLines.every(line => {
    const indent = line.match(/^\s*/)?.[0]?.length || 0
    return indent <= 4
  })

  if (!isFlat) {
    return text
  }

  const nodes = childLines.map(line => line.trim()).filter(Boolean)
  return rebuildGroupedMindmap(root, nodes)
}

const normalizeBareMindmap = (text) => {
  const compact = (text || '').trim()
  const rootMatch = compact.match(/^mindmap\s+root(\(\([^)]*\)\)|\([^)]*\)|\[[^\]]*\]|\{[^}]*\}|[^\s]+)\s*(.*)$/is)

  if (!rootMatch) {
    return compact
  }

  const root = rootMatch[1].trim()
  const rest = rootMatch[2].trim()
  const nodes = rest
    .split(/\s+/)
    .map(item => item.trim())
    .filter(Boolean)

  return rebuildGroupedMindmap(root, nodes)
}

const normalizeMermaidContent = (text) => {
  const raw = text || ''
  const trimmed = raw.trim()

  if (!trimmed || isFencedMermaid(trimmed)) {
    return raw
  }

  if (!MERMAID_START_RE.test(trimmed)) {
    return raw
  }

  const diagram = /^mindmap\b/i.test(trimmed)
    ? normalizeFlatMindmap(normalizeBareMindmap(trimmed))
    : trimmed

  return `\`\`\`mermaid\n${diagram}\n\`\`\``
}

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
  return md.render(normalizeMermaidContent(props.content))
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
