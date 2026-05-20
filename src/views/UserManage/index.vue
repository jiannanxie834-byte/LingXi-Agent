<template>
  <div class="admin-students-page" v-loading="loading">
    <h2> 全量学生学情全息画像大盘</h2>
    <el-table :data="studentList" border stripe style="width: 100%; margin-top: 15px;">
      <el-table-column prop="username" label="学生学号/账号" width="180" />
      <el-table-column prop="bio" label="个性签名/全息简介" min-width="250" />
      <el-table-column prop="hours" label="累计在研/AI学时 (小时)" width="180" align="center">
        <template #default="scope">
          <span style="font-weight: bold; color: #67c23a;">{{ scope.row.hours }} hrs</span>
        </template>
      </el-table-column>
      <el-table-column label="学情多维画像标签" min-width="200">
        <template #default="scope">
          <el-tag v-for="tag in scope.row.tags" :key="tag" size="small" style="margin-right: 5px;">{{ tag }}</el-tag>
          <span v-if="!scope.row.tags || scope.row.tags.length === 0" style="color: #ccc; font-size: 12px;">暂无AI画像</span>
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