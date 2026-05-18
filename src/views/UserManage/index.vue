<template>
  <div class="user-manage">
    <el-card shadow="never" class="table-card">
      <el-table :data="userList" style="width: 100%" border>
        <el-table-column prop="id" label="学号" width="100" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="direction" label="学习方向" width="140" />
        <el-table-column prop="learningHours" label="累计学习时长" width="140" />
        <el-table-column prop="portraitStatus" label="AI画像同步状态" width="160">
          <template #default="scope">
            <el-badge is-dot :type="scope.row.sync ? 'success' : 'danger'">
              <span style="font-size: 14px;">{{ scope.row.sync ? '已随学随新' : '需要更新' }}</span>
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column prop="regTime" label="注册时间" min-width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default>
            <el-button type="primary" link size="small">穿透查看画像</el-button>
            <el-button type="danger" link size="small">禁用</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const userList = ref([
  { id: '1001', name: '李同学', direction: 'Vue3 前端方向', learningHours: '128 小时', sync: true, regTime: '2026-04-01' },
  { id: '1002', name: '张同学', direction: 'Python 算法方向', learningHours: '94 小时', sync: true, regTime: '2026-04-03' },
  { id: '1003', name: '王同学', direction: '计算机网络攻坚', learningHours: '12 小时', sync: false, regTime: '2026-05-12' }
])
</script>

<style scoped>
.table-card { border-radius: 8px; }
</style>