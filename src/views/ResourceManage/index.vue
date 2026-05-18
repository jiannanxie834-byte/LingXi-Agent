<template>
  <div class="resource-manage">
    <el-card shadow="never" class="table-card">
      <div class="table-toolbar">
        <el-button type="primary">+ 上传自带标准教学资源</el-button>
        <el-input placeholder="搜索资源名称..." style="width: 260px;" />
      </div>

      <el-table :data="resourceList" style="width: 100%" border>
        <el-table-column prop="title" label="资源名称" min-width="180" />
        <el-table-column prop="type" label="资源类型" width="120">
          <template #default="scope">
            <el-tag>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uploader" label="上传者/生成者" width="140">
          <template #default="scope">
            <span :style="{ color: scope.row.isUserUploaded ? '#fa8c16' : '#52c41a' }">
              {{ scope.row.uploader }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="审核状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ getStatusText(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="提交时间" width="180" />
        <el-table-column label="管理操作" width="200" fixed="right">
          <template #default="scope">
            <div v-if="scope.row.status === 'pending'">
              <el-button type="success" size="small" @click="handleAudit(scope.$index, 'approved')">通过</el-button>
              <el-button type="danger" size="small" @click="handleAudit(scope.$index, 'rejected')">驳回</el-button>
            </div>
            <div v-else>
              <el-button type="primary" link size="small">查看</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(scope.$index)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const resourceList = ref([
  { title: 'Vue3 响应式全景思维导图.pdf', type: '思维导图', uploader: '系统自带', isUserUploaded: false, status: 'approved', time: '2026-05-10 10:00' },
  { title: '大模型提示词工程（Prompt）专项突破.mp4', type: '多模态视频', uploader: '张同学', isUserUploaded: true, status: 'pending', time: '2026-05-18 14:20' },
  { title: 'Python数据结构核心攻坚题库.docx', type: '课程文档', uploader: '李同学', isUserUploaded: true, status: 'pending', time: '2026-05-18 15:10' },
  { title: 'JavaScript 闭包必错题解析合集', type: '实操案例', uploader: '系统自带', isUserUploaded: false, status: 'approved', time: '2026-04-12 09:30' }
])

const getStatusType = (status) => {
  return { 'approved': 'success', 'pending': 'warning', 'rejected': 'danger' }[status]
}
const getStatusText = (status) => {
  return { 'approved': '正常开放', 'pending': '待管理员审核', 'rejected': '已驳回' }[status]
}

// 审核流操作
const handleAudit = (index, result) => {
  resourceList.value[index].status = result
  ElMessage.success(result === 'approved' ? '资源已上架开放' : '已成功驳回用户申请')
}

const handleDelete = (index) => {
  ElMessageBox.confirm('确定要永久删除该系统资源吗？', '警告', { type: 'warning' }).then(() => {
    resourceList.value.splice(index, 1)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.table-card { border-radius: 8px; }
.table-toolbar { display: flex; justify-content: space-between; margin-bottom: 20px; }
</style>