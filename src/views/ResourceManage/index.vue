<template>
  <div class="admin-review-page" v-loading="loading">
    
    <div class="section-box">
      <h2> 初始课程知识资源审核</h2>
      <el-table :data="resourceList" border stripe style="width: 100%; margin-top: 15px;">
        <el-table-column prop="id" label="资源编码" width="120" align="center" />
        <el-table-column prop="title" label="资源名称" min-width="200" />
        <el-table-column prop="type" label="资源模态" width="180" align="center">
          <template #default="scope">
            <el-tag effect="plain">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已通过' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作放行" width="180" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" :disabled="scope.row.status === '已通过'" @click="handleApproveRes(scope.row)">通过</el-button>
            <el-button size="small" type="danger" @click="handleRejectRes(scope.row)">下架</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="section-box" style="margin-top: 40px;">
      <h2> 学生申请自定义新Tab分类审核</h2>
      <el-table :data="typeList" border stripe style="width: 100%; margin-top: 15px;">
        <el-table-column prop="name" label="拟申请新分类名称" min-width="250" />
        <el-table-column label="当前审批状态" width="180" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已通过' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="批准决策" width="180" align="center">
          <template #default="scope">
            <el-button size="small" type="warning" :disabled="scope.row.status === '已通过'" @click="handleApproveType(scope.row)">
              批准全站动态新增
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllResourcesAPI, approveResourceAPI, rejectResourceAPI, getAllTypesAPI, approveTypeAPI } from '@/api/admin'

const loading = ref(false)
const resourceList = ref([])
const typeList = ref([])

// 拉取活数据
const loadAllReviewData = async () => {
  loading.value = true
  try {
    const resRes = await getAllResourcesAPI()
    if (resRes && resRes.code === 200) resourceList.value = resRes.data

    const typeRes = await getAllTypesAPI()
    if (typeRes && typeRes.code === 200) typeList.value = typeRes.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 资源通过
const handleApproveRes = async (row) => {
  const res = await approveResourceAPI(row.id)
  if (res && res.code === 200) {
    ElMessage.success(res.message)
    loadAllReviewData()
  }
}

// 资源下架
const handleRejectRes = async (row) => {
  const res = await rejectResourceAPI(row.id)
  if (res && res.code === 200) {
    ElMessage.success(res.message)
    loadAllReviewData()
  }
}

// 分类通过
const handleApproveType = async (row) => {
  const res = await approveTypeAPI(row.name)
  if (res && res.code === 200) {
    ElMessage.success(res.message)
    loadAllReviewData()
  }
}

onMounted(() => { loadAllReviewData() })
</script>

<style scoped>
.admin-review-page { padding: 24px; background: #fff; border-radius: 8px; }
.section-box h2 { margin: 0; font-size: 18px; color: #333; border-left: 4px solid #1890ff; padding-left: 10px; }
</style>