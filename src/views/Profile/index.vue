<template>
  <div class="profile-dashboard">
    <el-card class="user-hero-card" shadow="never">
      <div class="hero-flex-container">
        <el-upload
          action="#"
          accept="image/*"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="handleAvatarChange"
          class="avatar-uploader-wrapper"
        >
          <el-avatar :size="90" :src="userStore.avatar" class="profile-avatar">
            {{ displayName ? displayName.charAt(0).toUpperCase() : 'U' }}
          </el-avatar>
          <div class="change-mask">更换头像</div>
        </el-upload>

        <div class="profile-meta-info">
          <div class="name-edit-row">
            <h2 class="username-title">{{ displayName }}</h2>
            <span class="account-text">登录账号：{{ userStore.username }}</span>
          </div>
          
          <div class="bio-zone">
            <el-input
              v-if="isEditingBio"
              v-model="inputBio"
              size="small"
              maxlength="40"
              placeholder="写下你的座右铭吧..."
              @blur="saveBio"
              @keyup.enter="saveBio"
              ref="bioInputRef"
            />
            <p v-else class="bio-text" @click="startEditBio" title="点击即可修改个性签名">
              “{{ userStore.bio }}” <span class="edit-pen-icon">修改</span>
            </p>
          </div>
          
          <div class="knowledge-tags" v-if="knowledgeTags.length > 0">
            <span class="knowledge-tags-label">知识点概括</span>
            <div class="tags-row">
              <el-tag v-for="tag in knowledgeTags" :key="tag" size="small" class="custom-tag">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="hero-action-buttons">
          <el-button type="primary" plain @click="openEditDialog">修改资料</el-button>
          <el-button @click="feedbackVisible = true">问题反馈</el-button>
          <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
        </div>
        <el-dialog v-model="profileVisible" title="修改个人资料" width="450px" destroy-on-close>
      <el-form :model="profileForm" label-width="80px" label-position="left">
        <el-form-item label="登录账号">
          <el-input v-model="profileForm.username" disabled />
        </el-form-item>
        <el-form-item label="展示昵称">
          <el-input v-model="profileForm.nickname" maxlength="20" placeholder="请输入展示昵称，可与他人重复" />
        </el-form-item>
        <el-form-item label="密码">
          <div class="password-editor">
            <el-button
              v-if="!isChangingPassword"
              type="primary"
              plain
              @click="enablePasswordChange"
            >
              修改密码
            </el-button>
            <template v-else>
              <el-input
                v-model="profileForm.password"
                type="password"
                show-password
                autocomplete="new-password"
                placeholder="请输入新密码"
              />
              <el-button plain @click="cancelPasswordChange">取消修改</el-button>
            </template>
          </div>
        </el-form-item>
        <el-form-item label="头像">
          <div class="dialog-avatar-editor">
            <el-avatar :size="64" :src="profileForm.avatar" class="dialog-avatar-preview">
              {{ displayName ? displayName.charAt(0).toUpperCase() : 'U' }}
            </el-avatar>
            <el-upload
              action="#"
              accept="image/*"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleDialogAvatarChange"
            >
              <el-button type="primary" plain>选择图片</el-button>
            </el-upload>
            <el-button plain @click="clearDialogAvatar">移除头像</el-button>
          </div>
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input 
            v-model="profileForm.bio" 
            type="textarea" 
            :rows="2" 
            maxlength="40" 
            placeholder="写下你的座右铭吧..." 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="profileVisible = false">取 消</el-button>
          <el-button type="primary" :loading="loading" @click="handleUpdateProfile">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>
      </div>
    </el-card>

    <div class="dashboard-body-grid">
      
      <el-card class="grid-left-card" shadow="never">
        <template #header>
          <div class="card-header-bar">
            <span class="card-title">AI 动态学习画像</span>
            <div class="profile-header-meta">
              <el-tag size="small" effect="plain">6 项核心信息</el-tag>
              <el-tag size="small" type="success" effect="light" class="refresh-badge">
                {{ profileUpdateText }}
              </el-tag>
            </div>
          </div>
        </template>
        <div v-if="hasProfileData" class="profile-core-content">
          <p class="profile-method-note">
            分数只使用有效作答和任务记录；目标、薄弱点与偏好保留原始语义，不换算成虚拟分值。
          </p>

          <section class="quantitative-section">
            <h3>可量化学习状态</h3>
            <div v-for="item in quantitativeItems" :key="item.label" class="metric-row">
              <div class="metric-heading">
                <span>{{ item.label }}</span>
                <strong v-if="item.value !== null">{{ item.value }}<small> / 100</small></strong>
                <el-tag v-else size="small" type="info" effect="plain">{{ item.display }}</el-tag>
              </div>
              <el-progress
                v-if="item.value !== null"
                :percentage="item.value"
                :stroke-width="8"
                :show-text="false"
                :color="dimensionColor(item.value)"
              />
              <p>{{ item.evidence }}</p>
            </div>
          </section>

          <section class="descriptive-section">
            <h3>对话与行为结论</h3>
            <div v-for="item in descriptiveItems" :key="item.label" class="profile-fact-row">
              <div class="fact-label">
                <span>{{ item.label }}</span>
                <el-tag size="small" :type="statusType(item.status)" effect="plain">
                  {{ statusText(item.status) }}
                </el-tag>
              </div>
              <div v-if="item.kind === 'tags' && item.values.length" class="fact-tags">
                <el-tag v-for="value in item.values" :key="value" size="small" effect="light">
                  {{ value }}
                </el-tag>
              </div>
              <strong v-else class="fact-value">{{ item.display }}</strong>
              <p>{{ item.evidence }}</p>
            </div>
          </section>

          <div class="profile-evidence-footer">
            <span>画像证据：{{ profileEvidenceText }}</span>
            <span>缺少数据的维度保持待采集状态</span>
          </div>
        </div>
        <div v-else class="profile-empty-state">
          完成一次学习对话后，系统会先记录目标和自述基础；练习、评价与路径执行会继续补全六项核心画像。
        </div>
      </el-card>

      <div class="grid-right-stack">
        
        <el-card class="evaluation-card" shadow="never">
          <template #header>
            <div class="card-header-bar"><span class="card-title"> 学习评估概览</span></div>
          </template>
          <div class="stats-box-quad-grid">
            <div class="quad-item">
              <span class="quad-num">{{ profileStats.learning_hours }}</span>
              <span class="quad-label">累计学习(小时)</span>
            </div>
            <div class="quad-item">
              <span class="quad-num">{{ profileStats.published_resources }}</span>
              <span class="quad-label">专属生成资源</span>
            </div>
            <div class="quad-item">
              <span class="quad-num">{{ profileStats.knowledge_mastery }}%</span>
              <span class="quad-label">知识点掌握度</span>
            </div>
            <div class="quad-item">
              <span class="quad-num">{{ profileStats.current_weak_points }}</span>
              <span class="quad-label">当前易错点</span>
            </div>
          </div>
        </el-card>

        <el-card class="ai-advice-card" shadow="never">
          <template #header>
            <div class="card-header-bar"><span class="card-title"> 智能体学习建议</span></div>
          </template>
          
          <div v-if="!isNewUser" class="active-advice-list">
            <div class="advice-row info-blue">
              <strong>资源偏好：</strong>偏向于“{{ profileAdvice.style }}”。建议优先使用匹配该偏好的资源。
            </div>
            <div class="advice-row warning-orange">
              <strong>易错修复：</strong>{{ profileAdvice.weakness }}。
            </div>
            <div class="advice-row success-green">
              <strong>下一步规划：</strong>{{ profileAdvice.next }}
            </div>
          </div>
          
          <div v-else class="empty-advice-placeholder">
            <div class="empty-tip-alert-box">
               <strong>学习建议：</strong>完成一次学习对话后，这里会展示基于画像的学习建议。
            </div>
            <el-button type="primary" round size="large" class="quick-chat-btn" @click="router.push('/')">
               开始学习对话
            </el-button>
          </div>
        </el-card>

      </div>
    </div>

    <el-dialog v-model="feedbackVisible" title="提交问题反馈" width="400px" destroy-on-close>
      <el-input v-model="feedbackContent" type="textarea" :rows="4" placeholder="请描述问题或改进建议" />
      <template #footer>
        <el-button @click="feedbackVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getMyProfileAPI, submitFeedbackAPI, updateProfileAPI } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const avatarSaving = ref(false)
const profileStats = ref({
  learning_hours: Number(userStore.hours || 0),
  published_resources: 0,
  knowledge_mastery: 0,
  current_weak_points: 0
})
const MAX_AVATAR_FILE_SIZE = 3 * 1024 * 1024
const AVATAR_OUTPUT_SIZE = 320

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(file)
})

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = reject
  image.src = src
})

const buildAvatarDataUrl = async (rawFile) => {
  if (!rawFile) throw new Error('请选择图片')
  if (!rawFile.type || !rawFile.type.startsWith('image/')) {
    throw new Error('请选择图片文件')
  }
  if (rawFile.size > MAX_AVATAR_FILE_SIZE) {
    throw new Error('图片不能超过 3MB')
  }

  const dataUrl = await readFileAsDataUrl(rawFile)
  const image = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_OUTPUT_SIZE
  canvas.height = AVATAR_OUTPUT_SIZE
  const context = canvas.getContext('2d')

  const side = Math.min(image.width, image.height)
  const sourceX = Math.floor((image.width - side) / 2)
  const sourceY = Math.floor((image.height - side) / 2)

  context.drawImage(
    image,
    sourceX,
    sourceY,
    side,
    side,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE
  )

  return canvas.toDataURL('image/jpeg', 0.86)
}

// =================  个人资料更新  =================
const profileVisible = ref(false)
const profileForm = ref({
  username: '',
  nickname: '',
  password: '',
  avatar: '',
  bio: ''
})
const isChangingPassword = ref(false)

// 打开资料编辑对话框并回填当前信息
const openEditDialog = () => {
  isChangingPassword.value = false
  profileForm.value = {
    username: userStore.username,
    nickname: userStore.nickname || userStore.username,
    password: '', // 密码初始留空
    avatar: userStore.avatar,
    bio: userStore.bio
  }
  profileVisible.value = true
}

const enablePasswordChange = () => {
  isChangingPassword.value = true
  profileForm.value.password = ''
}

const cancelPasswordChange = () => {
  isChangingPassword.value = false
  profileForm.value.password = ''
}

const handleDialogAvatarChange = async (uploadFile) => {
  try {
    profileForm.value.avatar = await buildAvatarDataUrl(uploadFile.raw)
    ElMessage.success('头像已选择')
  } catch (error) {
    ElMessage.warning(error.message || '头像读取失败')
  }
}

const clearDialogAvatar = () => {
  profileForm.value.avatar = ''
}

// 提交更新逻辑
const handleUpdateProfile = async () => {
  if (!profileForm.value.username) return
  const passwordChanged = isChangingPassword.value && profileForm.value.password.trim()
  const payload = {
    username: profileForm.value.username,
    nickname: profileForm.value.nickname.trim(),
    password: passwordChanged ? profileForm.value.password.trim() : '',
    avatar: profileForm.value.avatar,
    bio: profileForm.value.bio
  }

  loading.value = true
  try {
    const res = await updateProfileAPI(payload)
    
    if (res && res.code === 200) {
      ElMessage.success('个人资料已保存')
      
      userStore.updateNickname(res.data.nickname)
      userStore.updateBio(res.data.bio)
      userStore.updateAvatar(res.data.avatar)
      
      profileVisible.value = false // 优雅关闭弹窗
      
      if (passwordChanged) {
        ElMessage.info('密码已更新，下次登录请使用新密码。')
      }
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    console.error('更新资料异常:', error)
  } finally {
    loading.value = false
  }
}

const displayName = computed(() => userStore.nickname || userStore.username || '学伴新用户')
const knowledgeTags = computed(() => userStore.tags || [])
const publicDimensionLabels = [
  '当前知识水平',
  '学习目标',
  '练习表现',
  '薄弱知识点',
  '路径执行',
  '资源偏好'
]

const splitProfileValues = (value) => {
  return String(value || '')
    .split(/[；;、，,\/]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 5)
}

const normalizePublicEntry = (label, entry = {}) => {
  const fallbackKind = ['当前知识水平', '练习表现', '路径执行'].includes(label) ? 'score' : 'text'
  const kind = entry.kind || fallbackKind
  const rawValue = entry.value
  const numericValue = kind === 'score' && rawValue !== null && rawValue !== '' && Number.isFinite(Number(rawValue))
    ? Math.max(0, Math.min(100, Math.round(Number(rawValue))))
    : null
  const values = kind === 'tags'
    ? (Array.isArray(rawValue) ? rawValue.filter(Boolean).slice(0, 5) : splitProfileValues(rawValue))
    : []
  return {
    label,
    kind,
    value: numericValue,
    values,
    display: entry.display || (numericValue !== null ? `${numericValue} 分` : (values.join('、') || '待采集')),
    status: entry.status || (numericValue !== null || values.length ? 'provisional' : 'pending'),
    evidence: entry.evidence || '后续学习行为会补充该维度的证据。',
    source: entry.source || 'none'
  }
}

const legacyPublicDimensions = computed(() => {
  const dimensions = userStore.profileDimensions || {}
  const radar = userStore.profileRadar || {}
  return {
    当前知识水平: {
      kind: 'score',
      value: radar['当前知识水平'] ?? radar['知识基础'] ?? null,
      display: dimensions['当前知识水平'] || dimensions['知识基础'] || '待有效作答诊断',
      status: radar['当前知识水平'] !== undefined || radar['知识基础'] !== undefined ? 'provisional' : 'pending',
      evidence: '历史画像已兼容保留，后续有效作答会替换为可追溯结果。'
    },
    学习目标: {
      kind: 'text',
      value: dimensions['学习目标'] || '',
      display: dimensions['学习目标'] || '待确认',
      status: dimensions['学习目标'] ? 'reported' : 'pending',
      evidence: '从学生对话中提取课程主题和学习任务。'
    },
    练习表现: {
      kind: 'score',
      value: radar['练习表现'] ?? null,
      display: dimensions['练习表现'] || '暂无有效作答',
      status: radar['练习表现'] !== undefined ? 'provisional' : 'pending',
      evidence: '完成可批改练习后更新。'
    },
    薄弱知识点: {
      kind: 'tags',
      value: splitProfileValues(dimensions['薄弱知识点'] || dimensions['易错修复']),
      display: dimensions['薄弱知识点'] || dimensions['易错修复'] || '待练习诊断',
      status: dimensions['薄弱知识点'] || dimensions['易错修复'] ? 'provisional' : 'pending',
      evidence: '根据错题知识点、作答反馈和评价记录归纳。'
    },
    路径执行: {
      kind: 'score',
      value: radar['路径执行'] ?? radar['规划执行'] ?? null,
      display: dimensions['路径执行'] || dimensions['规划执行'] || '尚无执行记录',
      status: radar['路径执行'] !== undefined || radar['规划执行'] !== undefined ? 'provisional' : 'pending',
      evidence: '根据当前主题的学习任务与待办完成情况统计。'
    },
    资源偏好: {
      kind: 'tags',
      value: splitProfileValues(dimensions['资源偏好'] || dimensions['媒介偏好']),
      display: dimensions['资源偏好'] || dimensions['媒介偏好'] || '待确认',
      status: dimensions['资源偏好'] || dimensions['媒介偏好'] ? 'provisional' : 'pending',
      evidence: '优先采用学生主动表达，后续结合资源反馈校正。'
    }
  }
})

const publicDimensionItems = computed(() => {
  const supplied = userStore.profilePublicDimensions || {}
  const source = Object.keys(supplied).length ? supplied : legacyPublicDimensions.value
  return publicDimensionLabels.map(label => normalizePublicEntry(label, source[label] || {}))
})

const quantitativeItems = computed(() => publicDimensionItems.value.filter(item => item.kind === 'score'))
const descriptiveItems = computed(() => publicDimensionItems.value.filter(item => item.kind !== 'score'))
const hasProfileData = computed(() => publicDimensionItems.value.some(item => item.status !== 'pending'))
const isNewUser = computed(() => !hasProfileData.value)

const dimensionColor = (value) => {
  if (value >= 85) return '#16a34a'
  if (value >= 70) return '#1890ff'
  if (value >= 55) return '#faad14'
  return '#f97316'
}

const statusText = (status) => ({
  observed: '行为证据',
  reported: '学生自述',
  provisional: '历史兼容',
  pending: '待采集'
}[status] || '待采集')

const statusType = (status) => ({
  observed: 'success',
  reported: 'primary',
  provisional: 'warning',
  pending: 'info'
}[status] || 'info')

const publicEntry = (label) => publicDimensionItems.value.find(item => item.label === label)
const profileEvidenceText = computed(() => {
  const evidence = userStore.profileEvidenceSummary || {}
  const count = Number(evidence.evidence_count || 0)
  const confidence = Number(evidence.confidence_score || 0)
  if (!count) return '当前以对话自述为主，等待有效作答'
  return `${count} 条有效记录${confidence ? `，证据置信度 ${confidence}%` : ''}`
})

const profileAdvice = computed(() => {
  const goal = publicEntry('学习目标')
  const preference = publicEntry('资源偏好')
  const weakness = publicEntry('薄弱知识点')
  return {
    style: preference?.display || '待确认',
    weakness: weakness?.display || '待练习诊断',
    next: goal?.status !== 'pending' ? `围绕「${goal.display}」安排下一轮资源与学习任务。` : '完成学习对话或评价后，系统将生成下一轮学习资源与路径。'
  }
})

const applyProfileSnapshot = (profile) => {
  if (profile && (profile.public_dimensions || profile.dimensions || profile.radar || profile.knowledge_tags || profile.tags)) {
    userStore.updateLearningProfile(profile)
  }
}

const refreshLearningProfile = async () => {
  if (!userStore.username) return
  try {
    const res = await getMyProfileAPI(userStore.username)
    applyProfileSnapshot(res?.data?.profile)
    profileStats.value = {
      learning_hours: Number(res?.data?.stats?.learning_hours ?? res?.data?.profile?.hours ?? userStore.hours ?? 0),
      published_resources: Number(res?.data?.stats?.published_resources || 0),
      knowledge_mastery: Number(res?.data?.stats?.knowledge_mastery || 0),
      current_weak_points: Number(res?.data?.stats?.current_weak_points || 0)
    }
  } catch (error) {
    console.error('画像刷新失败:', error)
  }
}

const handleLearningProfileUpdated = (event) => {
  applyProfileSnapshot(event?.detail)
}

const padTime = (value) => String(value).padStart(2, '0')

const profileUpdateText = computed(() => {
  const rawTime = userStore.profileUpdatedAt
  if (!rawTime) return '更新于刚刚'

  const updatedAt = new Date(rawTime)
  if (Number.isNaN(updatedAt.getTime())) return '更新于刚刚'

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const updatedDayStart = new Date(
    updatedAt.getFullYear(),
    updatedAt.getMonth(),
    updatedAt.getDate()
  )
  const dayDiff = Math.round((todayStart - updatedDayStart) / 86400000)
  const minuteDiff = Math.floor((now - updatedAt) / 60000)

  if (minuteDiff >= 0 && minuteDiff < 1) {
    return '更新于刚刚'
  }

  if (dayDiff === 0) {
    return `更新于${padTime(updatedAt.getHours())}:${padTime(updatedAt.getMinutes())}`
  }

  if (dayDiff === 1) return '更新于昨天'
  if (dayDiff === 2) return '更新于前天'

  const monthDay = `${updatedAt.getMonth() + 1}月${updatedAt.getDate()}日`
  if (updatedAt.getFullYear() !== now.getFullYear()) {
    return `更新于${updatedAt.getFullYear()}年${monthDay}`
  }

  return `更新于${monthDay}`
})

// =================  资料快捷更新  =================
const isEditingBio = ref(false)
const inputBio = ref('')
const bioInputRef = ref(null)

const startEditBio = () => {
  inputBio.value = userStore.bio
  isEditingBio.value = true
  nextTick(() => {
    if (bioInputRef.value) bioInputRef.value.focus()
  })
}

// 保存个性签名
const saveBio = async () => {
  isEditingBio.value = false
  if (inputBio.value.trim() === userStore.bio) return
  try {
    const res = await updateProfileAPI({
      username: userStore.username,
      password: '', // 不改密码
      avatar: userStore.avatar,
      bio: inputBio.value.trim()
    })
    if (res && res.code === 200) {
      userStore.updateBio(res.data.bio)
      ElMessage.success('个性签名已保存')
    }
  } catch (err) {
    console.error(err)
  }
}

// 上传并保存头像
const handleAvatarChange = async (file) => {
  if (avatarSaving.value) return
  avatarSaving.value = true
  try {
    const avatarDataUrl = await buildAvatarDataUrl(file.raw)
    const res = await updateProfileAPI({
      username: userStore.username,
      password: '',
      avatar: avatarDataUrl,
      bio: userStore.bio
    })
    if (res && res.code === 200) {
      userStore.updateAvatar(res.data.avatar)
      ElMessage.success('头像已保存')
    }
  } catch (err) {
    console.error(err)
    ElMessage.warning(err.message || '头像更新失败')
  } finally {
    avatarSaving.value = false
  }
}

// ================= 问题反馈业务 =================
const feedbackVisible = ref(false)
const feedbackContent = ref('')

const submitFeedback = async () => {
  if (!feedbackContent.value.trim()) return ElMessage.warning('内容不能为空')
  try {
    const res = await submitFeedbackAPI({
      username: userStore.username || 'student',
      content: feedbackContent.value
    })
    if (!res || res.code === 200) {
      ElMessage.success(res?.message || '反馈提交成功，管理员将在后台处理')
      feedbackContent.value = ''
      feedbackVisible.value = false
    } else {
      ElMessage.error(res.message || '提交失败，请重试')
    }
  } catch (error) {
    console.error('反馈网络中断:', error)
  }
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.warning('已退出当前账号')
  router.push('/')
}

onMounted(async () => {
  await refreshLearningProfile()
  window.addEventListener('lingxi-profile-updated', handleLearningProfileUpdated)
})

onUnmounted(() => {
  window.removeEventListener('lingxi-profile-updated', handleLearningProfileUpdated)
})
</script>

<style scoped>
.profile-dashboard { 
  padding: 24px; 
  max-width: 1400px; 
  margin: 0 auto; 
  box-sizing: border-box; 
  background-color: #f9fafb; 
  min-height: calc(100vh - 120px); 
}

/* 上部主卡片 */
.user-hero-card { 
  border-radius: 12px; 
  border: 1px solid #eaeaea; 
  margin-bottom: 24px; 
}
.hero-flex-container { 
  display: flex; 
  align-items: center; 
  gap: 24px; 
  position: relative; 
}

/* 头像更换动态遮罩 */
.avatar-uploader-wrapper { 
  position: relative; 
  border-radius: 50%; 
  overflow: hidden; 
  cursor: pointer; 
}
.profile-avatar { 
  background-color: #1890ff; 
  color: #fff; 
  font-size: 36px;
  font-weight: bold; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
}
.change-mask { 
  position: absolute; 
  bottom: 0; 
  left: 0; 
  width: 100%; 
  background: rgba(0,0,0,0.6); 
  color: #fff; 
  font-size: 11px; 
  text-align: center; 
  padding: 4px 0; 
  opacity: 0; 
  transition: opacity 0.2s; 
}
.avatar-uploader-wrapper:hover .change-mask { 
  opacity: 1; 
}

.profile-meta-info { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
}
.username-title { 
  margin: 0; 
  color: #111; 
  font-size: 24px; 
  font-weight: bold; 
}
.account-text {
  display: inline-block;
  margin-top: 4px;
  color: #8c8c8c;
  font-size: 12px;
}

/* 个签排版 */
.bio-zone { 
  min-height: 32px; 
  display: flex; 
  align-items: center; 
  max-width: 400px; 
}
.bio-text { 
  margin: 0; 
  color: #666; 
  font-size: 14px; 
  cursor: pointer; 
  font-style: italic; 
  display: flex; 
  align-items: center; 
  gap: 6px; 
}
.bio-text:hover { color: #1890ff; }
.edit-pen-icon { 
  font-size: 11px; 
  opacity: 0.6; 
}

.knowledge-tags {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.knowledge-tags-label {
  color: #8c8c8c;
  font-size: 12px;
  line-height: 22px;
}

.tags-row { display: flex; gap: 8px; flex-wrap: wrap; }
.custom-tag { 
  background-color: #e6f7ff; 
  color: #1890ff; 
  border-color: #91d5ff; 
  border-radius: 4px; 
  font-weight: 500; 
}

.hero-action-buttons { 
  display: flex; 
  gap: 12px; 
}

.dialog-avatar-editor {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.dialog-avatar-preview {
  background-color: #1890ff;
  color: #fff;
  font-weight: bold;
  flex: 0 0 auto;
}

.password-editor {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.password-editor .el-input {
  flex: 1;
}

/* 下部大网格布局 */
.dashboard-body-grid { 
  display: grid; 
  grid-template-columns: 1fr 1.2fr; 
  gap: 24px; align-items: start; 
}
.grid-left-card, 
.evaluation-card, 
.ai-advice-card { 
  border-radius: 12px; 
  border: 1px solid #eaeaea; 
}

.card-header-bar { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
}
.card-title { 
  font-size: 16px; 
  font-weight: bold; color: #333; 
}
.refresh-badge { 
  font-weight: bold; 
  color: #52c41a; 
}

.profile-header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-core-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.profile-method-note {
  margin: 0;
  padding: 11px 13px;
  border-left: 3px solid #409eff;
  background: #f2f8ff;
  color: #475569;
  font-size: 12px;
  line-height: 1.65;
}

.quantitative-section,
.descriptive-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quantitative-section h3,
.descriptive-section h3 {
  margin: 0;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.4;
}

.metric-row {
  padding-bottom: 12px;
  border-bottom: 1px solid #eef2f7;
}

.metric-row:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.metric-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.metric-heading span {
  color: #334155;
  font-size: 13px;
  font-weight: 650;
}

.metric-heading strong {
  color: #1677ff;
  font-size: 18px;
}

.metric-heading small {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
}

.metric-row p,
.profile-fact-row p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.55;
}

.profile-fact-row {
  padding: 11px 12px;
  border: 1px solid #e7edf5;
  border-radius: 8px;
  background: #fbfdff;
}

.fact-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}

.fact-label > span {
  color: #334155;
  font-size: 13px;
  font-weight: 650;
}

.fact-value {
  display: block;
  color: #0f172a;
  font-size: 14px;
  line-height: 1.55;
}

.fact-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.profile-evidence-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #eef2f7;
  color: #64748b;
  font-size: 11px;
  line-height: 1.5;
}

.profile-empty-state {
  margin-top: 10px;
  padding: 18px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
}

.grid-right-stack { 
  display: flex; 
  flex-direction: column; 
  gap: 24px; 
}

/* 四宫格学情数据卡 */
.stats-box-quad-grid { 
  display: grid; 
  grid-template-columns: repeat(2, 1fr); 
  gap: 16px; 
}
.quad-item { 
  background: #fff; 
  border: 1px solid #f0f0f0; 
  border-radius: 8px; 
  padding: 24px 16px; 
  text-align: center; 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
  transition: transform 0.2s; 
}
.quad-item:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
}
.quad-num { 
  font-size: 28px; 
  font-weight: bold; color: #1890ff; 
}
.quad-label { 
  font-size: 13px; color: #666; 
}

/* 竖条彩带样式列表 */
.active-advice-list { 
  display: flex; 
  flex-direction: column; 
  gap: 14px; 
}
.advice-row { 
  padding: 14px 16px; 
  border-radius: 6px; 
  font-size: 14px; 
  line-height: 1.6; 
  border-left: 5px solid; 
  color: #333; 
}
.info-blue { 
  background: #e6f7ff; 
  border-left-color: #1890ff; 
}
.warning-orange { 
  background: #fff7e8; 
  border-left-color: #fa8c16;
}
.success-green { 
  background: #f6ffed; 
  border-left-color: #52c41a; 
}

/*  新用户专属空值引导样式 */
.empty-advice-placeholder { 
  text-align: center;
   padding: 20px 0; 
  }
.empty-tip-alert-box { 
  font-size: 14px; 
  color: #fa8c16; 
  background: #fff7e8; 
  border: 1px solid #ffd591; 
  padding: 16px; 
  border-radius: 8px; 
  text-align: left; 
  line-height: 1.6; 
  margin-bottom: 20px; 
  font-weight: 500;
 }
.quick-chat-btn { 
  font-weight: bold; 
  padding: 12px 32px; 
  box-shadow: 0 4px 10px rgba(24, 144, 255, 0.3); 
  }
</style>
