<template>
  <div class="plan-page">
    <div class="page-header">
      <div class="title-wrap">
        <h2 class="main-title">个性化学习路径规划</h2>
        <p class="sub-title">AI 多智能体动态生成 ｜ 支持学生全自由度协同修改</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="createNewPlan">+ 新增独立规划路线</button>
        <button class="btn btn-primary" @click="addGlobalTask">+ 添加独立自定义任务</button>
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
              <button class="inline-add-btn" @click="insertTask(pIndex, 0)">+ 在最前插入任务</button>
            </div>
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
                      <select v-model="step.status" class="status-select">
                        <option value="completed">已学完</option>
                        <option value="active">进行中</option>
                        <option value="pending">待开始</option>
                      </select>
                      <button class="delete-step-btn" @click="deleteStep(pIndex, sIndex)">✕</button>
                    </div>
                  </div>
                  <p class="step-desc">{{ step.desc }}</p>
                  
                  <div class="linked-resources" v-if="step.resources && step.resources.length">
                    <div v-for="res in step.resources" :key="res" class="res-tag">🔗 {{ res }}</div>
                  </div>

                  <div class="insert-trigger-zone">
                    <button class="insert-btn" @click="insertTask(pIndex, sIndex + 1)">
                      + 在此处插入下一步任务
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
            <h3>📌 独立待办清单</h3>
          </div>
          <div class="task-list">
            <div class="task-item" v-for="(task, index) in myTasks" :key="task.id">
              <div class="task-left">
                <input type="checkbox" v-model="task.done" />
                <span :class="{ 'done': task.done }">{{ task.content }}</span>
              </div>
              <button class="delete-task-btn" @click="deleteGlobalTask(index)">✕</button>
            </div>
            <div class="empty-hint" v-if="myTasks.length === 0">暂无自定义待办</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 1. 核心状态：多路线规划数组（支持任意增删折叠）
const plans = ref([
  {
    id: 1,
    title: 'Vue3 高级实战路线 (AI 专属定制)',
    isCollapsed: false,
    isAiGenerated: true,
    tasks: [
      { id: 101, title: 'Vue3 组合式 API 入门', desc: '掌握 setup, ref, reactive 等核心响应式函数。', status: 'completed', isCustom: false, resources: ['Vue3 官方文档'] },
      { id: 102, title: '深度理解生命周期与 Watcher', desc: '分析 Hook 调用时机及侦听器高级用法。', status: 'active', isCustom: false, resources: ['生命周期流程图'] },
      { id: 103, title: 'Vue-Router 与 Pinia 进阶', desc: '单页面应用的路由管理及全局状态管理。', status: 'pending', isCustom: false, resources: [] }
    ]
  },
  {
    id: 2,
    title: '计算机网络体系复习冲刺',
    isCollapsed: true, // 默认收缩
    isAiGenerated: false,
    tasks: [
      { id: 201, title: 'TCP/IP 五层模型概述', desc: '理清物理层到应用层的基本职责。', status: 'completed', isCustom: false, resources: [] },
      { id: 202, title: '三次握手与四次挥手详解', desc: '核心常考点，理解状态转移图。', status: 'pending', isCustom: false, resources: ['抓包实操案例'] }
    ]
  }
])

// 2. 独立自定义任务数组
const myTasks = ref([
  { id: 1, content: '完成计网第三章课后习题', done: true },
  { id: 2, content: '复习 JavaScript 异步编程', done: false }
])

// 切换规划路线的收缩状态
const togglePlan = (index) => {
  plans.value[index].isCollapsed = !plans.value[index].isCollapsed
}

// 【功能1】新增整条独立规划路线
const createNewPlan = () => {
  const title = prompt('请输入新规划的名称:')
  if (!title || !title.trim()) return
  plans.value.push({
    id: Date.now(),
    title: title,
    isCollapsed: false,
    isAiGenerated: false,
    tasks: [{ id: Date.now() + 1, title: '准备开始的第一步', desc: '点击下方在此处插入新任务。', status: 'pending', isCustom: true, resources: [] }]
  })
}

// 【功能2】在规划路线的任意位置（之前/之后）“插针”插入任务
const insertTask = (planIndex, targetStepIndex) => {
  const taskTitle = prompt('请输入你要插入的任务名称:')
  if (!taskTitle || !taskTitle.trim()) return
  const taskDesc = prompt('请输入任务描述（可选）:') || '学生自主补充的个性化学习任务。'

  const newTask = {
    id: Date.now(),
    title: taskTitle,
    desc: taskDesc,
    status: 'pending',
    isCustom: true, // 标记为学生自主添加
    resources: []
  }

  // 使用 splice 在指定位置完美插入
  plans.value[planIndex].tasks.splice(targetStepIndex, 0, newTask)
}

// 【功能3】删除规划里的某一步
const deleteStep = (planIndex, stepIndex) => {
  if (confirm('确定要删除这条路线中的该任务吗？')) {
    plans.value[planIndex].tasks.splice(stepIndex, 1)
  }
}

// 【功能4】添加独立自定义清单任务
const addGlobalTask = () => {
  const content = prompt('请输入待办事项:')
  if (!content || !content.trim()) return
  myTasks.value.push({
    id: Date.now(),
    content: content,
    done: false
  })
}

// 【功能5】彻底删除独立清单任务（右侧✕号触发）
const deleteGlobalTask = (index) => {
  myTasks.value.splice(index, 1)
}

// 动态计算总体进度
const totalProgress = computed(() => {
  let total = 0
  let completed = 0
  plans.value.forEach(p => {
    p.tasks.forEach(t => {
      total++
      if (t.status === 'completed') completed++
    })
  })
  return total ? Math.round((completed / total) * 100) : 0
})
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

.header-left { display: flex; align-items: center; gap: 12px; }
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
.linked-resources { display: flex; flex-wrap: wrap; gap: 6px; }
.res-tag { font-size: 11px; background: #f5f5f5; border: 1px solid #d9d9d9; padding: 2px 8px; border-radius: 4px; color: #555; }

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

/* 待办清单 */
.tasks-card-header { margin-bottom: 16px; }
.task-list { display: flex; flex-direction: column; }
.task-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0; border-bottom: 1px solid #f0f0f0; transition: background 0.2s;
}
.task-item:hover { background: #fafafa; }
.task-left { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #333; }
.task-left span.done { text-decoration: line-through; color: #bfbfbf; }

.delete-task-btn {
  background: none; border: none; color: #ccc;
  cursor: pointer; font-size: 12px; padding: 4px; transition: color 0.2s;
}
.task-item:hover .delete-task-btn { color: #8c8c8c; }
.delete-task-btn:hover { color: #f5222d !important; }
.empty-hint { text-align: center; color: #ccc; font-size: 13px; padding: 20px 0; }
</style>