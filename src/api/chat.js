import request from '@/utils/request'
import { sanitizePublicPayload, sanitizePublicText } from '@/utils/publicContent'

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
  'plain_qa',
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
  'artifact_id',
  'resource_id',
  'course_id',
  'chapter_id',
  'section_id',
  'unit_id',
  'unit_ids',
  'agent_trace_id',
  'quality_score',
  'risk_level',
  'safety_review',
  'teaching_quality_review',
  'evidence_review',
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
  return typeof value === 'string' ? sanitizePublicText(value) : value
}

const normalizeProgress = (progress = []) => {
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
  const isPlain = PLAIN_ROUTE_TYPES.has(routeType) || message.content_type === 'conversation_reply'
  const allowLearningDisplay = !isPlain && (LEARNING_ROUTE_TYPES.has(routeType) || (!routeType && message.content_type !== 'conversation_reply'))
  const resourceStatus = allowLearningDisplay
    ? stripInternalFields(data.resource_status || {})
    : {}

  return {
    content: sanitizePublicText(message.content || data.reply || ''),
    contentType: message.content_type || 'student_answer',
    routeType,
    progress: allowLearningDisplay ? normalizeProgress(data.progress || []) : [],
    cards: allowLearningDisplay ? stripInternalFields(data.cards || []) : [],
    generationJob: resourceStatus.job_id ? {
      jobId: resourceStatus.job_id,
      status: resourceStatus.status || 'queued',
      progress: 0,
      message: sanitizePublicText(resourceStatus.message) || '已创建资源生成任务',
      events: []
    } : null,
    traceId: '',
    sessionId: data.session_id || '',
    session: data.session || null,
    profile: isPlain ? null : sanitizePublicPayload(data.profile || null),
    messageId: data.message_id || data.assistant_message_id || '',
    userMessageId: data.user_message_id || ''
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

export const deleteChatSessionAPI = (sessionId, username) => request({
  url: `/chat/sessions/${sessionId}`,
  method: 'delete',
  params: { username }
})

export const deleteChatMessageAPI = (messageId, username) => request({
  url: `/chat/messages/${messageId}`,
  method: 'delete',
  params: { username }
})

export const sendChatMessageAPI = (data) => request({
  url: '/chat/send',
  method: 'post',
  data
})
