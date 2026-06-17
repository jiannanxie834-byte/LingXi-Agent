<template>
  <div class="admin-students-page" v-loading="loading">
    <h2> 学生学习画像管理</h2>
    <el-table :data="studentList" border stripe class="student-table">
      <el-table-column label="学生信息" width="190">
        <template #default="scope">
          <div class="student-identity">
            <span class="student-nickname">{{ scope.row.nickname || scope.row.username }}</span>
            <span class="student-account">登录账号：{{ scope.row.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="知识点概括" min-width="360">
        <template #default="scope">
          <div class="tag-list" v-if="scope.row.tags && scope.row.tags.length > 0">
            <el-tag v-for="tag in scope.row.tags" :key="tag" size="small" effect="plain">
              {{ tag }}
            </el-tag>
          </div>
          <span v-else class="empty-text">暂无知识点记录</span>
        </template>
      </el-table-column>
      <el-table-column prop="hours" label="累计AI学时" width="130" align="center">
        <template #default="scope">
          <span class="hours-text">{{ scope.row.hours }} hrs</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllStudentsAPI } from '@/api/admin'

const loading = ref(false)
const studentList = ref([])

const fetchStudents = async () => {
  loading.value = true
  try {
    const res = await getAllStudentsAPI()
    if (res && res.code === 200) studentList.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchStudents() })
</script>

<style scoped>
.admin-students-page {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.admin-students-page h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
  border-left: 4px solid #1890ff;
  padding-left: 10px;
}

.student-table {
  width: 100%;
  margin-top: 15px;
}

.student-identity {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.student-nickname {
  color: #1f2937;
  font-weight: 600;
  word-break: break-word;
}

.student-account {
  color: #8c8c8c;
  font-size: 12px;
  word-break: break-word;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.empty-text {
  color: #bfbfbf;
  font-size: 12px;
}

.hours-text {
  color: #67c23a;
  font-weight: 700;
}
</style>
