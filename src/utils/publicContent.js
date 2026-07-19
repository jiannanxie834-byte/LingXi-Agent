const INTERNAL_FIELD_KEYS = new Set([
  'debug',
  'debug_info',
  'raw_output',
  'raw_response',
  'agent_notes',
  'agent_trace',
  'agent_trace_id',
  'trace_id',
  'pipeline_steps',
  'knowledge_chunks',
  'reasoning',
  'reasoning_content',
  'thinking',
  'thoughts',
  'chain_of_thought',
  'internal_reasoning',
  'internal_thoughts',
  'system_prompt',
  'developer_prompt',
  'tool_calls'
])

const INTERNAL_HEADING_RE = /^(?:#{1,6}\s*)?(?:内部(?:思考|推理|分析|过程)|思考过程|推理过程|分析过程|模型思考|模型推理|chain\s*of\s*thought|reasoning|analysis)(?:\s*[：:]|\s*$)/i
const FINAL_HEADING_RE = /^(?:#{1,6}\s*)?(?:最终答案|最终回答|直接回答|回答|结论|结果)(?:\s*[：:]\s*)?(.*)$/i
const INTERNAL_LINE_RE = /^\s*(?:[-*]\s*)?(?:reasoning_content|chain_of_thought|internal_reasoning|internal_thoughts|raw_output|agent_notes|system_prompt|developer_prompt|pipeline_steps|knowledge_chunks|trace_id|agent_trace_id)\s*[：:=]/i
const INTERNAL_OPERATION_RE = /(?:[A-Za-z][A-Za-z0-9_]*Agent|智能体)\s*(?:调用|执行|输入|输出|正在推理|推理链|分析链)|(?:调用|交给|转交给)\s*[A-Za-z][A-Za-z0-9_]*Agent/i
const TECHNICAL_ERROR_RE = /(?:Traceback|stack trace|SQLSTATE|OperationalError|IntegrityError|File\s+"[^"]+"|\bat\s+\w+[.(]|HTTP\s+5\d\d)/i
const LEGACY_TEMPLATE_HEADINGS = new Set([
  '可以先抓住这几个重点',
  '建议下一步这样做',
  '需要注意'
])

export const sanitizePublicText = (value) => {
  if (value == null) return ''
  let text = String(value)

  text = text
    .replace(/<(think|analysis|reasoning|internal_reasoning|internal_thoughts)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(think|analysis|reasoning|internal_reasoning|internal_thoughts)[^>]*>[\s\S]*$/gi, '')
    .replace(/```(?:analysis|reasoning|thought|thinking)\s*[\s\S]*?```/gi, '')
    .replace(/"(?:reasoning_content|chain_of_thought|internal_reasoning|internal_thoughts|raw_output|agent_notes)"\s*:\s*"(?:\\.|[^"\\])*"\s*,?/gi, '')
    .replace(/\s*ResourceArtifact\s*/gi, '学习资源')
    .replace(/\s*Artifact\s*/gi, '资源')
    .replace(/(?:知识库|课程库|课程)依据/g, '课程资料')
    .replace(/资源\s+生成/g, '资源生成')
    .replace(/个性化\s+学习资源/g, '个性化学习资源')
    .replace(/正在执行可读性、资源缺失和学生端字段检查/g, '正在检查资源质量与安全')
    .replace(/学生端字段/g, '展示内容')

  const output = []
  let hidingInternalSection = false

  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    const headingText = trimmed
      .replace(/^#{1,6}\s*/, '')
      .replace(/^\*\*(.*?)\*\*$/, '$1')
      .trim()
    if (LEGACY_TEMPLATE_HEADINGS.has(headingText)) return
    if (INTERNAL_HEADING_RE.test(trimmed)) {
      hidingInternalSection = true
      return
    }

    if (hidingInternalSection) {
      const finalMatch = trimmed.match(FINAL_HEADING_RE)
      if (finalMatch) {
        hidingInternalSection = false
        if (finalMatch[1]) output.push(finalMatch[1])
        return
      }
      if (/^#{1,6}\s+/.test(trimmed)) {
        hidingInternalSection = false
      } else {
        return
      }
    }

    if (INTERNAL_LINE_RE.test(trimmed) || INTERNAL_OPERATION_RE.test(trimmed)) return
    output.push(line)
  })

  return output.join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export const sanitizePublicPayload = (value) => {
  if (Array.isArray(value)) return value.map(sanitizePublicPayload)
  if (!value || typeof value !== 'object') {
    return typeof value === 'string' ? sanitizePublicText(value) : value
  }

  const userAuthored = String(value.role || '').toLowerCase() === 'user'
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !INTERNAL_FIELD_KEYS.has(String(key).toLowerCase()))
      .map(([key, item]) => {
        if (userAuthored && key === 'content') return [key, item]
        return [key, sanitizePublicPayload(item)]
      })
  )
}

export const publicErrorMessage = (value, fallback = '系统遇到了一点小状况') => {
  const message = sanitizePublicText(value)
  if (!message || TECHNICAL_ERROR_RE.test(message)) return fallback
  return message
}
