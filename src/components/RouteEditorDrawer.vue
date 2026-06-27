<template>
  <el-drawer
    v-model="visible"
    title="重构学习路线"
    size="720px"
    destroy-on-close
  >
    <el-form v-if="draft" label-width="96px" class="route-editor-form">
      <el-form-item label="路线标题">
        <el-input v-model="draft.title" placeholder="请输入路线标题" />
      </el-form-item>

      <el-form-item label="路线说明">
        <el-input v-model="draft.desc" type="textarea" :rows="3" placeholder="请输入路线说明或学习目标" />
      </el-form-item>

      <el-form-item label="折叠状态">
        <el-switch v-model="draft.isCollapsed" active-text="默认折叠" inactive-text="默认展开" />
      </el-form-item>

      <div class="task-editor-list">
        <div
          v-for="(task, index) in draft.tasks"
          :key="task.id || index"
          class="task-editor-item"
        >
          <div class="task-editor-header">
            <strong>第 {{ index + 1 }} 步</strong>
            <div class="task-editor-actions">
              <el-button size="small" @click="moveTask(index, -1)" :disabled="index === 0">上移</el-button>
              <el-button size="small" @click="moveTask(index, 1)" :disabled="index === draft.tasks.length - 1">下移</el-button>
              <el-button size="small" type="danger" @click="deleteTask(index)">删除</el-button>
            </div>
          </div>

          <el-input v-model="task.title" placeholder="任务标题" />
          <el-input v-model="task.desc" type="textarea" :rows="2" placeholder="任务描述" />

          <div class="task-inline-fields">
            <el-select v-model="task.status" placeholder="状态">
              <el-option label="待开始" value="pending" />
              <el-option label="进行中" value="active" />
              <el-option label="已完成" value="completed" />
            </el-select>
            <el-input v-model="task.unit_id" placeholder="绑定知识点 unit_id，如 dl_cnn_conv_basic" />
          </div>

          <div class="resource-editor">
            <div class="resource-editor-title">绑定资源</div>
            <div
              v-for="(res, rIndex) in task.resources"
              :key="res.id || rIndex"
              class="resource-row"
            >
              <el-input v-model="res.title" placeholder="资源标题" />
              <el-input v-model="res.type" placeholder="资源类型" />
              <el-input v-model="res.unit_id" placeholder="unit_id" />
              <el-button type="danger" plain @click="deleteResource(index, rIndex)">删除资源</el-button>
            </div>

            <el-button size="small" @click="addResource(index)">+ 添加资源</el-button>
          </div>
        </div>
      </div>

      <el-button type="primary" plain @click="addTask">+ 添加新步骤</el-button>
    </el-form>

    <el-empty v-else description="暂无可编辑路线" />

    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" @click="save">保存重构路线</el-button>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  plan: { type: Object, default: null }
})

const emit = defineEmits(['update:modelValue', 'save'])

const draft = ref(null)

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const clone = value => JSON.parse(JSON.stringify(value || null))

const normalizeResource = (resource = {}, task = {}, index = 0) => {
  const query = resource.query || {}
  const artifactId = query.artifact_id || resource.artifact_id || ''
  const resourceId = query.resource_id || resource.resource_id || ''
  const route = artifactId ? (resource.route || '/resource') : ''
  return {
    id: resource.id || resource.artifact_id || resource.resource_id || `res_${Date.now()}_${index}`,
    artifact_id: artifactId,
    resource_id: resourceId,
    title: resource.title || '学习资源',
    type: resource.type || '',
    unit_id: resource.unit_id || task.unit_id || '',
    route,
    query: {
      ...query,
      artifact_id: artifactId,
      resource_id: resourceId,
      unit_id: resource.unit_id || task.unit_id || '',
      type: resource.type || ''
    }
  }
}

const normalizeDraft = (plan) => {
  const next = clone(plan)
  if (!next) return null
  next.title = next.title || '未命名学习路线'
  next.desc = next.desc || ''
  next.tasks = Array.isArray(next.tasks) ? next.tasks : []
  next.tasks = next.tasks.map((task, index) => {
    const normalized = {
      ...task,
      id: task.id || `node_${Date.now()}_${index}`,
      title: task.title || `第 ${index + 1} 步`,
      desc: task.desc || '',
      status: task.status || (index === 0 ? 'active' : 'pending'),
      unit_id: task.unit_id || ''
    }
    normalized.resources = (task.resources || []).map((res, rIndex) => {
      if (typeof res === 'string') {
        return normalizeResource({ title: res, route: '' }, normalized, rIndex)
      }
      return normalizeResource(res, normalized, rIndex)
    })
    return normalized
  })
  return next
}

watch(
  () => props.plan,
  plan => {
    draft.value = normalizeDraft(plan)
  },
  { immediate: true, deep: true }
)

const moveTask = (index, direction) => {
  const nextIndex = index + direction
  if (!draft.value || nextIndex < 0 || nextIndex >= draft.value.tasks.length) return
  const list = draft.value.tasks
  const [item] = list.splice(index, 1)
  list.splice(nextIndex, 0, item)
}

const deleteTask = (index) => {
  draft.value.tasks.splice(index, 1)
}

const addTask = () => {
  draft.value.tasks.push({
    id: `node_${Date.now()}`,
    title: '新学习步骤',
    desc: '',
    status: 'pending',
    isCustom: true,
    unit_id: '',
    resources: []
  })
}

const addResource = (taskIndex) => {
  const task = draft.value.tasks[taskIndex]
  task.resources.push(normalizeResource({
    title: '新绑定资源',
    type: '',
    unit_id: task.unit_id || ''
  }, task, task.resources.length))
}

const deleteResource = (taskIndex, resourceIndex) => {
  draft.value.tasks[taskIndex].resources.splice(resourceIndex, 1)
}

const close = () => {
  visible.value = false
}

const save = () => {
  if (!draft.value?.title?.trim()) {
    return ElMessage.warning('路线标题不能为空')
  }
  for (const task of draft.value.tasks || []) {
    if (!task.title?.trim()) {
      return ElMessage.warning('每个任务标题都不能为空')
    }
    task.resources = (task.resources || []).map((resource, index) => normalizeResource(resource, task, index))
  }
  emit('save', clone(draft.value))
}
</script>

<style scoped>
.route-editor-form {
  padding-right: 8px;
}
.task-editor-list {
  display: grid;
  gap: 14px;
  margin-bottom: 16px;
}
.task-editor-item {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
}
.task-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.task-editor-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.task-inline-fields {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 10px;
}
.resource-editor {
  display: grid;
  gap: 8px;
  padding: 10px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #eef2f7;
}
.resource-editor-title {
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
}
.resource-row {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr 1fr auto;
  gap: 8px;
  align-items: center;
}
</style>
