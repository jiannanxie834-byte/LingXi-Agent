<template>
  <div class="profile-dashboard">
    <el-card class="user-hero-card" shadow="never">
      <div class="hero-flex-container">
        <el-upload
          action="#"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="handleAvatarChange"
          class="avatar-uploader-wrapper"
        >
          <el-avatar :size="90" :src="userStore.avatar" class="profile-avatar">
            {{ userStore.username ? userStore.username.charAt(0).toUpperCase() : 'U' }}
          </el-avatar>
          <div class="change-mask">更换头像</div>
        </el-upload>

        <div class="profile-meta-info">
          <div class="name-edit-row">
            <h2 class="username-title">{{ userStore.username || '学伴新用户' }}</h2>
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
          
          <div class="tags-row" v-if="userStore.tags && userStore.tags.length > 0">
            <el-tag v-for="tag in userStore.tags" :key="tag" size="small" class="custom-tag">
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <div class="hero-action-buttons">
          <el-button @click="feedbackVisible = true">问题反馈</el-button>
          <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
        </div>
      </div>
    </el-card>

    <div class="dashboard-body-grid">
      
      <el-card class="grid-left-card" shadow="never">
        <template #header>
          <div class="card-header-bar">
            <span class="card-title"> AI动态学习画像</span>
            <el-tag size="small" type="success" effect="light" class="refresh-badge">刚刚随学随新</el-tag>
          </div>
        </template>
        <div ref="radarChartRef" class="radar-chart-container"></div>
      </el-card>

      <div class="grid-right-stack">
        
        <el-card class="evaluation-card" shadow="never">
          <template #header>
            <div class="card-header-bar"><span class="card-title"> 学习评估概览</span></div>
          </template>
          <div class="stats-box-quad-grid">
            <div class="quad-item">
              <span class="quad-num">{{ isNewUser ? '0' : '128' }}</span>
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
              <strong>风格认知：</strong>偏向于“视觉-活跃型”。建议多使用系统生成的“多模态视频”和“思维导图”资源。
            </div>
            <div class="advice-row warning-orange">
              <strong>目前的弱点：</strong>Vue3组合式API、计算机网络协议。
            </div>
            <div class="advice-row success-green">
              <strong>下一步规划：</strong>已自动在【规划】页面为您生成《Vue3进阶突击路线》。
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import * as echarts from 'echarts' //  引入 ECharts 图表库
import { submitFeedbackAPI } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

// 判断当前是否是新注册的用户
const isNewUser = computed(() => userStore.username !== 'student')

// 个签编辑逻辑控制
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

const saveBio = () => {
  isEditingBio.value = false
  userStore.updateBio(inputBio.value.trim())
  ElMessage.success('个签修改成功！')
}

// 头像本地替换
const handleAvatarChange = (file) => {
  const localUrl = URL.createObjectURL(file.raw)
  userStore.updateAvatar(localUrl)
  ElMessage.success('头像成功与顶部同步更新！')
}

// 问题反馈
const feedbackVisible = ref(false)
const feedbackContent = ref('')

// profile.vue 中的 submitFeedback 函数替换为：
const submitFeedback = async () => {
  if (!feedbackContent.value.trim()) return ElMessage.warning('内容不能为空')

  try {
    const res = await submitFeedbackAPI({
      username: userStore.username || 'student',
      content: feedbackContent.value
    })

    // 如果 res 是 undefined（说明被拦截器剥离了），但没进 catch 就说明已经是 200 成功了！
    if (!res || res.code === 200) {
      // 如果拦截器把整个 res 吞了，我们就用前端兜底的成功提示
      ElMessage.success(res?.message || '反馈提交成功！系统已实时呈递给最高管理员。') 
      feedbackContent.value = ''
      feedbackVisible.value = false
    } else {
      ElMessage.error(res.message || '提交失败，请重试')
    }
  } catch (error) {
    console.error('反馈发送网络轰炸失败:', error)
    ElMessage.error('网络中断，请检查后端 start.bat 服务是否开启')
  }
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  ElMessage.warning('已退出当前账号')
  router.push('/')
}

// =================  ECharts 雷达图渲染内核 =================
const radarChartRef = ref(null)
let myChart = null

const initRadarChart = () => {
  if (!radarChartRef.value) return
  myChart = echarts.init(radarChartRef.value)
  
  // 核心判定：如果是新用户，数值全设为 0（渲染出一个只保留轴线的“空雷达图”）
  const radarData = isNewUser.value 
    ? [0, 0, 0, 0, 0, 0] 
    : [85, 75, 92, 88, 70, 78]

  const option = {
    radar: {
      indicator: [
        { name: '知识基础', max: 100 },
        { name: '自驱探索力', max: 100 },
        { name: '实践动手能力', max: 100 },
        { name: '学习专注度', max: 100 },
        { name: '易错点偏好', max: 100 },
        { name: '认知风格', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 5,
      axisName: { color: '#333', fontSize: 13, fontWeight: 'bold' },
      splitLine: { lineStyle: { color: 'rgba(24, 144, 255, 0.15)' } },
      splitArea: { areaStyle: { color: ['#fff', '#f9fafb'] } },
      axisLine: { lineStyle: { color: 'rgba(24, 144, 255, 0.2)' } }
    },
    series: [{
      type: 'radar',
      // 🌟新用户如果没有数值，连蓝色阴影区也完全隐藏，只留个空架子
      data: isNewUser.value ? [] : [{
        value: radarData,
        name: '学情全息动态画像',
        areaStyle: { color: 'rgba(24, 144, 255, 0.25)' },
        lineStyle: { color: '#1890ff', width: 2 },
        itemStyle: { color: '#1890ff' }
      }]
    }]
  }
  myChart.setOption(option)
}

onMounted(() => {
  initRadarChart()
  // 窗口缩放自适应大小
  window.addEventListener('resize', () => myChart && myChart.resize())
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

.tags-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
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
.radar-chart-container { height: 380px; width: 100%; }

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