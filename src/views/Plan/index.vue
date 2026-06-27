<template>
  <div class="plan-page">
    <div class="page-header">
      <div class="title-wrap">
        <h2 class="main-title">《深度学习》个性化学习路径规划</h2>
        <p class="sub-title">基于课程图谱与多智能体生成 ｜ 支持 CNN、反向传播、Transformer、PyTorch 项目动态调整</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="createNewPlan">+ 新增自主规划路线</button>
        <button class="btn btn-primary" @click="addGlobalTask">+ 添加自主任务</button>
      </div>
    </div>

    <div class="plan-content">
      <div class="left-section">
        <div 
          v-for="(plan, pIndex) in plans" 
          :key="plan.id" 
          class="plan-group card"
          :class="{ 'is-collapsed': plan.isCollapsed }"
        >
          <div class="plan-group-header" @click="togglePlan(pIndex)">
            <div class="header-left">
              <span class="fold-icon">{{ plan.isCollapsed ? '▶' : '▼' }}</span>
              <span class="ai-tag" :class="plan.isAiGenerated ? 'ai' : 'custom'">
                {{ plan.isAiGenerated ? 'AI 智能规划' : '学生自建' }}
              </span>
              <h3>{{ plan.title }}</h3>
            </div>
            <div class="header-right" @click.stop>
              <button class="inline-edit-route-btn" @click.stop="openRouteEditor(pIndex)">重构路线</button>
              <button class="inline-add-btn" @click="insertTask(pIndex, 0)">+ 插入首个任务</button>
            </div>
            <el-popconfirm 
                title="确定要彻底销毁整条学习路线吗？此操作不可逆！" 
                confirm-button-text="销毁" 
                cancel-button-text="取消"
                confirm-button-type="danger"
                @confirm="handleDeleteRoute(plan.id)"
              >
                <template #reference>
                  <el-button type="primary" plain size="small" style="margin-left: 10px;">
                    删除路线
                  </el-button>
                </template>
              </el-popconfirm>
          </div>

          <div class="timeline-container" v-show="!plan.isCollapsed">
            <div class="timeline">
              <div 
                v-for="(step, sIndex) in plan.tasks" 
                :key="step.id" 
                class="timeline-item" 
                :class="[step.status, { 'is-student-added': step.isCustom }]"
              >
                <div class="timeline-node">
                  <div class="node-dot">
                    <span v-if="step.status === 'completed'">✓</span>
                    <span v-else>{{ sIndex + 1 }}</span>
                  </div>
                  <div class="node-line" v-if="sIndex !== plan.tasks.length - 1"></div>
                </div>
                
                <div class="timeline-body">
                  <div class="step-top">
                    <h4>
                      <span v-if="step.isCustom" class="custom-badge">学生添加</span>
                      {{ step.title }}
                    </h4>
                    <div class="step-actions">
                      <select v-model="step.status" class="status-select" @change="persistPlans">
                        <option value="completed">已学完</option>
                        <option value="active">进行中</option>
                        <option value="pending">待开始</option>
                      </select>
                      <button class="delete-step-btn" @click="deleteStep(pIndex, sIndex)">✕</button>
                    </div>
                  </div>
                  <p class="step-desc">{{ step.desc }}</p>
                  
                  <div class="linked-resources" v-if="step.resources && step.resources.length">
                    <template
                      v-for="res in step.resources"
                      :key="res.id"
                    >
                      <button
                        v-if="isLinkedResource(res)"
                        type="button"
                        class="res-tag res-link"
                        @click.stop="openStepResource(res, step)"
                      >
                        🔗 {{ res.title }}
                      </button>
                      <span
                        v-else
                        class="res-tag res-static"
                      >
                        {{ res.title }}
                      </span>
                    </template>
                  </div>

                  <div class="insert-trigger-zone">
                    <button class="insert-btn" @click="insertTask(pIndex, sIndex + 1)">
                      + 插入下一步
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="side-section">
        <div class="card progress-card">
          <h3>总体路径掌控度</h3>
          <div class="progress-circle">
            <svg viewBox="0 0 36 36" class="circular-chart blue">
              <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="circle" :stroke-dasharray="totalProgress + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.35" class="percentage">{{ totalProgress }}%</text>
            </svg>
          </div>
          <div class="progress-info">
            <p>已击破核心知识点比例</p>
          </div>
        </div>

        <div class="card tasks-card">
          <div class="tasks-card-header">
            <h3>自主任务清单</h3>
            <button class="mini-add-btn" @click="addGlobalTask">+ 新增</button>
          </div>
          <div class="task-list">
            <div class="task-item" v-for="(task, index) in myTasks" :key="task.id">
              <div class="task-left">
                <input type="checkbox" v-model="task.done" @change="persistTodos" />
                <span :class="{ 'done': task.done }">{{ task.content }}</span>
              </div>
              <div class="task-actions">
                <button class="edit-task-btn" @click="editGlobalTask(index)">编辑</button>
                <button class="delete-task-btn" @click="deleteGlobalTask(index)">✕</button>
              </div>
            </div>
            <div class="empty-hint" v-if="myTasks.length === 0">暂无自主任务，可点击上方新增</div>
          </div>
        </div>
      </div>
    </div>

    <RouteEditorDrawer
      v-model="routeEditorVisible"
      :plan="editingPlanDraft"
      @save="saveRouteEditor"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
//  1. 精准导入 API 文件里真实暴露的名字
import { getPlanListAPI, deleteRouteAPI, savePlanAPI } from '@/api/plan'
import { getTodoListAPI, saveTodoAPI } from '@/api/todo'
import { ElMessage, ElMessageBox } from 'element-plus'
import RouteEditorDrawer from '@/components/RouteEditorDrawer.vue'

const userStore = useUserStore()
const router = useRouter()
const loading = ref(false)

//  2. 核心状态：彻底清空写死的数据，等待后端投喂！
const plans = ref([])

// 独立自定义任务数组 (属于本地功能，暂时保留)
const myTasks = ref([])
const routeEditorVisible = ref(false)
const editingPlanIndex = ref(-1)
const editingPlanDraft = ref(null)

//  3. 初始化拉取：页面一加载就去轰鸣后端
onMounted(() => {
  fetchPlansData()
  fetchTodoData()
})

//  4. 重新拉取活数据的通用函数
const fetchPlansData = async () => {
  loading.value = true
  try {
    const res = await getPlanListAPI(userStore.username)
    if (res && res.code === 200) {
      plans.value = (res.data || []).map(normalizePlan)
    }
  } catch (error) {
    console.error('拉取路线失败:', error)
  } finally {
    loading.value = false
  }
}

const persistPlans = async (successMessage = '') => {
  try {
    plans.value = plans.value.map(normalizePlan)
    const res = await savePlanAPI(userStore.username, plans.value)
    if (successMessage && res && res.code === 200) {
      ElMessage.success(successMessage)
    }
  } catch (error) {
    console.error('保存学习路线失败:', error)
  }
}

const normalizeStepResources = (resources = [], step = {}) => {
  return (resources || []).map((res, index) => {
    if (typeof res === 'string') {
      return {
        id: `${step.id || 'step'}_res_${index}`,
        title: res,
        type: 'unknown',
        unit_id: step.unit_id || '',
        route: '',
        query: {}
      }
    }
    const query = res.query || {}
    const artifactId = query.artifact_id || res.artifact_id || ''
    const resourceId = query.resource_id || res.resource_id || ''
    const route = artifactId ? (res.route || '/resource') : ''
    return {
      id: res.id || res.resource_id || res.artifact_id || `${step.id || 'step'}_res_${index}`,
      title: res.title || res.name || '学习资源',
      type: res.type || 'resource',
      unit_id: res.unit_id || step.unit_id || '',
      route,
      artifact_id: artifactId,
      resource_id: resourceId,
      query: {
        ...query,
        artifact_id: artifactId,
        resource_id: resourceId,
        unit_id: res.unit_id || step.unit_id || '',
        type: res.type || ''
      }
    }
  })
}

const isLinkedResource = (res = {}) => Boolean(res.route && res.query?.artifact_id)

const normalizePlan = (plan = {}) => {
  const normalized = {
    ...plan,
    id: plan.id || `route_${Date.now()}`,
    title: plan.title || '未命名学习路线',
    desc: plan.desc || plan.description || '',
    isCollapsed: Boolean(plan.isCollapsed),
    isAiGenerated: plan.isAiGenerated !== false,
    tasks: Array.isArray(plan.tasks) ? plan.tasks : []
  }
  normalized.tasks = normalized.tasks.map((task, index) => {
    const step = {
      ...task,
      id: task.id || `node_${index + 1}`,
      title: task.title || `第 ${index + 1} 步`,
      desc: task.desc || task.objective || '',
      status: task.status || (index === 0 ? 'active' : 'pending'),
      isCustom: Boolean(task.isCustom),
      unit_id: task.unit_id || ''
    }
    step.resources = normalizeStepResources(task.resources || [], step)
    return step
  })
  return normalized
}

//  5. 删除整条路线
const handleDeleteRoute = async (routeId) => {
  try {
    const res = await deleteRouteAPI(userStore.username, routeId)
    if (res && res.code === 200) {
      ElMessage.success('学习路线已删除')
      fetchPlansData() // 删完立刻重新拉取，刷新视图
    }
  } catch (error) {
    console.error('删除路线失败:', error)
  }
}

//  6.剥离单个任务节点 (替换掉你之前的 deleteStep)
const confirmAction = async (message, title = '提示') => {
  try {
    await ElMessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    return true
  } catch (error) {
    return false
  }
}

const promptText = async (message, title, options = {}) => {
  try {
    const { value } = await ElMessageBox.prompt(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: options.placeholder || '',
      inputValue: options.value || '',
      inputPattern: options.required === false ? undefined : /\S/,
      inputErrorMessage: options.errorMessage || '请输入有效内容'
    })
    return (value || '').trim()
  } catch (error) {
    return ''
  }
}

const deleteStep = async (planIndex, stepIndex) => {
  const confirmed = await confirmAction('确定要删除这条路线中的该任务吗？')
  if (!confirmed) return
  plans.value[planIndex].tasks.splice(stepIndex, 1)
  await persistPlans('任务节点已成功剥离！')
}

// 切换规划路线的收缩状态 (纯前端 UI 控制，无需连后端)
const togglePlan = (index) => {
  plans.value[index].isCollapsed = !plans.value[index].isCollapsed
}

// 【提醒】新增路线和插入任务目前是纯前端操作，刷新会丢失。
// 等 AI 接口调通后，这部分也会变成真实 API 交互！
const createNewPlan = async () => {
  const title = await promptText('请输入新规划的名称', '新增自主规划路线', {
    placeholder: '如：监督学习复习路线'
  })
  if (!title) return
  plans.value.push({
    id: `route_${Date.now()}`,
    title,
    desc: '学生自主创建的学习路线。',
    isCollapsed: false,
    isAiGenerated: false,
    tasks: [{ id: `node_${Date.now() + 1}`, title: '准备开始的第一步', desc: '点击下方在此处插入新任务。', status: 'pending', isCustom: true, unit_id: '', resources: [] }]
  })
  persistPlans('新规划路线已保存')
}

const insertTask = async (planIndex, targetStepIndex) => {
  const taskTitle = await promptText('请输入你要插入的任务名称', '插入学习任务', {
    placeholder: '如：完成混淆矩阵专项练习'
  })
  if (!taskTitle) return
  const taskDesc = await promptText('请输入任务描述（可选）', '任务描述', {
    required: false,
    placeholder: '如：结合例题区分准确率、精确率和召回率'
  }) || '学生自主补充的个性化学习任务。'

  const newTask = {
    id: `node_${Date.now()}`, title: taskTitle, desc: taskDesc, status: 'pending', isCustom: true, unit_id: '', resources: []
  }
  plans.value[planIndex].tasks.splice(targetStepIndex, 0, newTask)
  persistPlans('新任务已插入路线')
}

const addGlobalTask = async () => {
  const content = await promptText('请输入任务内容', '新增自主任务', {
    placeholder: '如：复习第4章模型评估'
  })
  if (!content) return
  myTasks.value.push({
    id: Date.now(),
    content,
    done: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  await persistTodos()
  ElMessage.success('自主任务已新增')
}

const editGlobalTask = async (index) => {
  const task = myTasks.value[index]
  const nextContent = await promptText('修改任务内容', '编辑自主任务', {
    value: task.content,
    placeholder: '请输入新的任务内容'
  })
  if (!nextContent) return
  myTasks.value[index] = {
    ...task,
    content: nextContent,
    updated_at: new Date().toISOString()
  }
  await persistTodos()
  ElMessage.success('自主任务已更新')
}

const deleteGlobalTask = async (index) => {
  myTasks.value.splice(index, 1)
  await persistTodos()
}

// 动态计算总体进度
const totalProgress = computed(() => {
  let total = 0
  let completed = 0
  plans.value.forEach(p => {
    if(p.tasks) { // 加个容错，防止后端传来的 tasks 为空
      p.tasks.forEach(t => {
        total++
        if (t.status === 'completed') completed++
      })
    }
  })
  return total ? Math.round((completed / total) * 100) : 0
})

const fetchTodoData = async () => {
  try {
    const res = await getTodoListAPI(userStore.username)

    if (res && res.code === 200) {
      myTasks.value = res.data
    }
  } catch (error) {
    console.error('拉取待办失败:', error)
  }
}

const persistTodos = async () => {
  try {
    await saveTodoAPI(userStore.username, myTasks.value)
  } catch (error) {
    console.error('保存待办失败:', error)
  }
}

const openStepResource = (res, step) => {
  if (!res?.route) {
    ElMessage.info('该资源尚未绑定详情页')
    return
  }
  router.push({
    path: res.route,
    query: {
      ...(res.query || {}),
      step_id: step.id,
      unit_id: res.unit_id || step.unit_id || ''
    }
  })
}

const openRouteEditor = (planIndex) => {
  editingPlanIndex.value = planIndex
  editingPlanDraft.value = JSON.parse(JSON.stringify(normalizePlan(plans.value[planIndex])))
  routeEditorVisible.value = true
}

const saveRouteEditor = async (draft) => {
  if (editingPlanIndex.value < 0) return
  plans.value[editingPlanIndex.value] = {
    ...normalizePlan(draft),
    updated_at: new Date().toISOString()
  }
  routeEditorVisible.value = false
  editingPlanDraft.value = null
  editingPlanIndex.value = -1
  await persistPlans('路线已重构')
}
</script>

<style scoped>
.plan-page {
  padding: 24px;
  height: 100%;
  background-color: #f7f9fc;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 顶部全局控制栏 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.main-title { margin: 0 0 4px 0; font-size: 22px; color: #1a1a1a; }
.sub-title { margin: 0; color: #8c8c8c; font-size: 14px; }
.header-actions { display: flex; gap: 12px; }

.btn {
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  border: none;
  font-size: 14px;
}
.btn-primary { background: #1890ff; color: white; }
.btn-primary:hover { background: #40a9ff; }
.btn-secondary { background: #e6f7ff; color: #1890ff; border: 1px solid block; }
.btn-secondary:hover { background: #bae7ff; }

.plan-content {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

/* ================== 左侧规划组与折叠样式 ================== */
.plan-group {
  margin-bottom: 20px;
  padding: 0; /* 让头部通栏 */
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}
.plan-group-header {
  padding: 20px 24px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #f0f0f0;
}
.plan-group-header:hover { background: #fafafa; }
.plan-group.is-collapsed .plan-group-header { border-bottom: none; }

.header-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.fold-icon { font-size: 12px; color: #999; transition: transform 0.3s; width: 14px; }

.ai-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  color: white;
}
.ai-tag.ai { background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%); }
.ai-tag.custom { background: linear-gradient(to right, #f6d365 0%, #fda085 100%); }

.header-left h3 { margin: 0; font-size: 16px; color: #333; }
.inline-add-btn {
  background: none; border: 1px dashed #1890ff; color: #1890ff;
  padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;
}
.inline-add-btn:hover { background: #e6f7ff; }
.inline-edit-route-btn {
  background: #fff;
  border: 1px solid #dbeafe;
  color: #2563eb;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.inline-edit-route-btn:hover { background: #eff6ff; }

/* 时间轴布局容器 */
.timeline-container { padding: 24px 32px; background: #fcfcfc; }
.timeline { margin-top: 10px; }
.timeline-item { display: flex; gap: 20px; padding-bottom: 20px; position: relative; }

.timeline-node { display: flex; flex-direction: column; align-items: center; width: 32px; flex-shrink: 0; }
.node-dot {
  width: 28px; height: 28px; border-radius: 50%; background: #e8e8e8;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: bold; color: #999; z-index: 2;
}
.node-line { width: 2px; flex: 1; background: #e8e8e8; margin-top: -2px; }

/* 状态颜色控制 */
.completed .node-dot { background: #52c41a; color: white; }
.completed .node-line { background: #52c41a; }
.active .node-dot { background: #1890ff; color: white; box-shadow: 0 0 8px rgba(24, 144, 255, 0.4); }
.active .node-line { background: #e8e8e8; }

/* 任务卡片容器 */
.timeline-body {
  flex: 1; background: white; padding: 16px; border-radius: 8px;
  border: 1px solid #e8e8e8; position: relative; transition: all 0.2s;
}
.timeline-body:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* 学生自己加的路线任务底色稍作区别，彰显个性化修改 */
.is-student-added .timeline-body { border-left: 4px solid #f6d365; background: #fffdf9; }
.custom-badge { background: #fff7e6; color: #fa8c16; font-size: 11px; padding: 1px 4px; border-radius: 3px; margin-right: 6px; }

.step-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.step-top h4 { margin: 0; font-size: 15px; color: #333; }
.step-actions { display: flex; align-items: center; gap: 8px; }

.status-select { padding: 2px 6px; border-radius: 4px; border: 1px solid #d9d9d9; font-size: 12px; color: #595959; outline: none; }
.delete-step-btn { background: none; border: none; color: #ccc; cursor: pointer; font-size: 14px; padding: 0 4px; }
.delete-step-btn:hover { color: #f5222d; }

.step-desc { font-size: 13px; color: #666; margin: 0 0 12px 0; line-height: 1.5; }
.linked-resources { display: flex; flex-wrap: wrap; gap: 8px; }
.res-tag { font-size: 11px; background: #f5f5f5; border: 1px solid #d9d9d9; padding: 2px 8px; border-radius: 4px; color: #555; }
.res-link {
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #2563eb;
  cursor: pointer;
  border-radius: 6px;
  padding: 4px 10px;
}
.res-link:hover { background: #dbeafe; }
.res-static {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  background: #f8fafc;
  color: #64748b;
  border-color: #e2e8f0;
}

/* 🌟 插针区域：隐藏在两个任务之间，鼠标悬浮时高亮显示 */
.insert-trigger-zone {
  position: absolute; bottom: -18px; left: 0; width: 100%;
  display: flex; justify-content: center; z-index: 10; opacity: 0;
  transition: opacity 0.2s; height: 16px;
}
.timeline-item:hover .insert-trigger-zone { opacity: 1; }
.insert-btn {
  background: #1890ff; color: white; border: none; font-size: 11px;
  padding: 2px 12px; border-radius: 10px; cursor: pointer; box-shadow: 0 2px 6px rgba(24,144,255,0.3);
}
.insert-btn:hover { background: #40a9ff; transform: scale(1.05); }

/* ================== 右侧进度 & 清单样式 ================== */
.progress-circle { width: 140px; margin: 16px auto; }
.circular-chart { display: block; margin: 10px auto; max-width: 100%; }
.circle-bg { stroke: #f0f0f0; stroke-width: 2.8; fill: none; }
.circle { stroke: #1890ff; stroke-width: 2.8; stroke-linecap: round; fill: none; transition: stroke-dasharray 0.3s ease; }
.percentage { fill: #333; font-size: 8px; text-anchor: middle; font-weight: bold; }
.progress-info { text-align: center; font-size: 13px; color: #666; }

/* 自主任务清单 */
.tasks-card-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.tasks-card-header h3 { margin: 0; }
.mini-add-btn {
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #2563eb;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 12px;
}
.mini-add-btn:hover { background: #dbeafe; }
.task-list { display: flex; flex-direction: column; }
.task-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0; border-bottom: 1px solid #f0f0f0; transition: background 0.2s;
}
.task-item:hover { background: #fafafa; }
.task-left { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #333; min-width: 0; }
.task-left span { word-break: break-word; }
.task-left span.done { text-decoration: line-through; color: #bfbfbf; }
.task-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.edit-task-btn {
  border: none;
  background: #f0f7ff;
  color: #2563eb;
  border-radius: 5px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
}
.edit-task-btn:hover { background: #dbeafe; }

.delete-task-btn {
  background: none; border: none; color: #ccc;
  cursor: pointer; font-size: 12px; padding: 4px; transition: color 0.2s;
}
.task-item:hover .delete-task-btn { color: #8c8c8c; }
.delete-task-btn:hover { color: #f5222d !important; }
.empty-hint { text-align: center; color: #ccc; font-size: 13px; padding: 20px 0; }
</style>
