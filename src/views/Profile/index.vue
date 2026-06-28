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
            <span class="card-title"> AI动态学习画像</span>
            <el-tag size="small" type="success" effect="light" class="refresh-badge">
              {{ profileUpdateText }}
            </el-tag>
          </div>
        </template>
        <div ref="radarChartRef" class="radar-chart-container"></div>
        <div v-if="hasProfileData" class="dimension-grid">
          <div
            v-for="item in dimensionItems"
            :key="item.label"
            class="dimension-tile"
          >
            <div class="dimension-head">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <el-progress
              :percentage="item.value"
              :stroke-width="7"
              :show-text="false"
              :color="item.color"
            />
            <p>{{ item.description }}</p>
          </div>
        </div>
        <div v-else class="profile-empty-state">
          完成一次学习对话或学习评价后，系统会自动生成十维动态画像。
        </div>
      </el-card>

      <div class="grid-right-stack">
        
        <el-card class="evaluation-card" shadow="never">
          <template #header>
            <div class="card-header-bar"><span class="card-title"> 学习评估概览</span></div>
          </template>
          <div class="stats-box-quad-grid">
            <div class="quad-item">
              <span class="quad-num">{{ userStore.hours || 0 }}</span>
              <span class="quad-label">累计学习(小时)</span>
            </div>
            <div class="quad-item">
              <span class="quad-num">{{ isNewUser ? '0' : '15' }}</span>
              <span class="quad-label">专属生成资源</span>
            </div>
            <div class="quad-item">
              <span class="quad-num">{{ isNewUser ? '0%' : '92%' }}</span>
              <span class="quad-label">知识点掌握度</span>
            </div>
            <div class="quad-item">
              <span class="quad-num">{{ isNewUser ? '0' : '3' }}</span>
              <span class="quad-label">攻克易错错点</span>
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
               <strong>小提示：</strong>这里空空如也，快去和你的学习小助手开启你的学习之路吧~
            </div>
            <el-button type="primary" round size="large" class="quick-chat-btn" @click="router.push('/')">
               立即呼叫 AI 学习小助手
            </el-button>
          </div>
        </el-card>

      </div>
    </div>

    <el-dialog v-model="feedbackVisible" title="提交问题反馈" width="400px" destroy-on-close>
      <el-input v-model="feedbackContent" type="textarea" :rows="4" placeholder="说出你的吐槽或优化建议..." />
      <template #footer>
        <el-button @click="feedbackVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import * as echarts from 'echarts' 
import { getMyProfileAPI, submitFeedbackAPI, updateProfileAPI } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const avatarSaving = ref(false)
let resizeHandler = null
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

// =================  个人资料全栈更新内核  =================
const profileVisible = ref(false)
const profileForm = ref({
  username: '',
  nickname: '',
  password: '',
  avatar: '',
  bio: ''
})
const isChangingPassword = ref(false)

// 点击“修改资料”按钮：开箱，并执行标准的数据流回显
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
      ElMessage.success('资料同步云端成功！')
      
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
const radarLabels = [
  '知识基础',
  '学习目标',
  '概念理解',
  '练习表现',
  '实践能力',
  '规划执行',
  '复盘能力',
  '易错修复',
  '媒介偏好',
  '兴趣方向'
]
const radarValues = computed(() => {
  if (!userStore.profileRadar || Object.keys(userStore.profileRadar).length === 0) {
    return radarLabels.map(() => 0)
  }
  return radarLabels.map(label => Number(userStore.profileRadar[label] || 0))
})
const hasProfileData = computed(() => {
  const radar = userStore.profileRadar || {}
  const dimensions = userStore.profileDimensions || {}
  return Object.values(radar).some(value => Number(value) > 0) || Object.keys(dimensions).length > 0
})
// 判断当前是否真正没有画像数据，而不是按演示账号名硬编码判断
const isNewUser = computed(() => !hasProfileData.value)
const dimensionDescriptions = {
  知识基础: '结合当前主题、同主题历史表现和近期综合学习证据估算。',
  学习目标: '根据自然语言目标、规划需求、项目诉求和学习行为判断清晰度。',
  概念理解: '由评价记录、主题定位、反馈表达清晰度和知识单元掌握情况共同计算。',
  练习表现: '来自练习题作答、AI 批改、同主题练习均分和错因记录。',
  实践能力: '反映代码实验、项目任务和动手训练的准备度。',
  规划执行: '结合学习计划、待办任务和学习路径完成情况判断。',
  复盘能力: '来自错因说明、评价记录、作答反馈和补弱记录。',
  易错修复: '衡量薄弱点是否被练习、评价和补弱资源持续修复。',
  媒介偏好: '根据图解、导图、文字、代码、练习等资源使用和表达偏好动态更新。',
  兴趣方向: '概括近期关注知识点和数据结构与算法应用方向。'
}
const dimensionColor = (value) => {
  if (value >= 85) return '#16a34a'
  if (value >= 70) return '#1890ff'
  if (value >= 55) return '#faad14'
  return '#f97316'
}
const dimensionItems = computed(() => {
  return radarLabels.map((label, index) => {
    const rawValue = Number(radarValues.value[index] || 0)
    const value = Math.max(0, Math.min(100, Math.round(rawValue)))
    return {
      label,
      value,
      color: dimensionColor(value),
      description: dimensionDescriptions[label]
    }
  })
})
const profileAdvice = computed(() => {
  const dimensions = userStore.profileDimensions || {}
  return {
    style: dimensions['媒介偏好'] || '待学习数据生成',
    weakness: dimensions['易错修复'] || '待学习评价生成',
    next: dimensions['学习目标'] ? `围绕「${dimensions['学习目标']}」生成下一轮学习资源与路径。` : '完成学习对话或评价后，系统将生成下一轮学习资源与路径。'
  }
})

const applyProfileSnapshot = (profile) => {
  if (profile && (profile.dimensions || profile.radar || profile.knowledge_tags || profile.tags)) {
    userStore.updateLearningProfile(profile)
  }
}

const refreshLearningProfile = async () => {
  if (!userStore.username) return
  try {
    const res = await getMyProfileAPI(userStore.username)
    applyProfileSnapshot(res?.data?.profile)
  } catch (error) {
    console.error('画像刷新失败:', error)
  }
}

const handleLearningProfileUpdated = (event) => {
  applyProfileSnapshot(event?.detail)
  nextTick(() => initRadarChart())
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

// =================  快捷轻量级内联更新  =================
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

// 内联快捷保存个签：同样后端接口保持一致性
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
      ElMessage.success('个签已同步至云端！')
    }
  } catch (err) {
    console.error(err)
  }
}

// 头像快捷本地上传更换：同样后端
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
      ElMessage.success('头像已实时存盘！')
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
      ElMessage.success(res?.message || '反馈提交成功！系统已实时呈递给最高管理员。') 
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

// ================= ECharts 雷达图渲染内核 =================
const radarChartRef = ref(null)
let myChart = null

const initRadarChart = () => {
  if (!radarChartRef.value) return
  if (!myChart) {
    myChart = echarts.init(radarChartRef.value)
  }
  
  const option = {
    radar: {
      indicator: radarLabels.map(name => ({ name, max: 100 })),
      shape: 'polygon',
      splitNumber: 5,
      axisName: { color: '#333', fontSize: 13, fontWeight: 'bold' },
      splitLine: { lineStyle: { color: 'rgba(24, 144, 255, 0.15)' } },
      splitArea: { areaStyle: { color: ['#fff', '#f9fafb'] } },
      axisLine: { lineStyle: { color: 'rgba(24, 144, 255, 0.2)' } }
    },
    series: [{
      type: 'radar',
      data: hasProfileData.value ? [{
        value: radarValues.value,
        name: '学情全息动态画像',
        areaStyle: { color: 'rgba(24, 144, 255, 0.25)' },
        lineStyle: { color: '#1890ff', width: 2 },
        itemStyle: { color: '#1890ff' }
      }] : []
    }]
  }
  myChart.clear()
  myChart.setOption(option)
}

onMounted(async () => {
  await refreshLearningProfile()
  initRadarChart()
  resizeHandler = () => myChart && myChart.resize()
  window.addEventListener('resize', resizeHandler)
  window.addEventListener('lingxi-profile-updated', handleLearningProfileUpdated)
})

onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  window.removeEventListener('lingxi-profile-updated', handleLearningProfileUpdated)
})

watch([radarValues, hasProfileData], () => {
  initRadarChart()
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

/* 雷达图尺寸容器 */
.radar-chart-container { height: 300px; width: 100%; }

.dimension-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 8px;
}

.dimension-tile {
  padding: 10px 12px;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  background: #fbfdff;
}

.dimension-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 7px;
}

.dimension-head span {
  min-width: 0;
  color: #1f2937;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
}

.dimension-head strong {
  flex-shrink: 0;
  color: #1677ff;
  font-size: 17px;
  line-height: 1;
}

.dimension-tile p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
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
