import request from '@/utils/request'

export const SHOW_AGENT_TRACE = String(import.meta.env.VITE_SHOW_AGENT_TRACE || 'false') === 'true'

export const LEARNING_ROUTE_TYPES = new Set([
  'new_learning_request',
  'learning_request',
  'concept_question',
  'followup',
  'followup_question',
  'continue_previous',
  'continue_topic'
])

export const PLAIN_ROUTE_TYPES = new Set([
  'acknowledgement',
  'clarification',
  'clarification_needed',
  'small_talk',
  'smalltalk',
  'casual_chat',
  'topic_rejection',
  'topic_switch',
  'meta_question',
  'out_of_scope'
])

const INTERNAL_KEYS = new Set([
  'debug',
  'raw_output',
  'agent_notes',
  'knowledge_chunks',
  'recommend_score',
  'matched_tags',
  '_recommend_rank',
  'pipeline_steps',
  'evidence',
  'teaching_sources',
  'external_evidence',
  'safety_summary'
])

const PUBLIC_PROGRESS_LABELS = {
  understand: '理解需求',
  collect: '整理资料',
  profile: '更新画像',
  answer: '生成建议',
  match: '匹配资料',
  plan: '生成路线',
  resources: '整理资源',
  check: '完成检查'
}

const stripInternalFields = (value) => {
  if (Array.isArray(value)) {
    return value.map(stripInternalFields)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !INTERNAL_KEYS.has(key))
        .map(([key, item]) => [key, stripInternalFields(item)])
    )
  }
  return value
}

const normalizeProgress = (progress = []) => {
  if (!SHOW_AGENT_TRACE) return []
  return (progress || [])
    .filter(item => item && PUBLIC_PROGRESS_LABELS[item.key])
    .map(item => ({
      key: item.key,
      label: PUBLIC_PROGRESS_LABELS[item.key],
      status: item.status || 'completed'
    }))
}

export const normalizeStudentChatData = (response) => {
  const data = response?.data || response || {}
  const message = data.message || {}
  const routeType = data.route_type || data.routeType || ''
  const allowLearningDisplay = LEARNING_ROUTE_TYPES.has(routeType) || (!routeType && message.content_type !== 'conversation_reply')

  return {
    content: message.content || data.reply || '',
    contentType: message.content_type || 'student_answer',
    routeType,
    progress: allowLearningDisplay ? normalizeProgress(data.progress || []) : [],
    cards: allowLearningDisplay ? stripInternalFields(data.cards || []) : [],
    traceId: SHOW_AGENT_TRACE ? data.trace_id || '' : '',
    sessionId: data.session_id || '',
    session: data.session || null,
    profile: data.profile || null
  }
}

export const getChatSessionsAPI = (username) => request({
  url: '/chat/sessions',
  method: 'get',
  params: { username }
})

export const getChatMessagesAPI = (sessionId, username) => request({
  url: `/chat/sessions/${sessionId}/messages`,
  method: 'get',
  params: { username }
})

export const sendChatMessageAPI = (data) => request({
  url: '/chat/send',
  method: 'post',
  data
})
