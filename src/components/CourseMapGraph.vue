<template>
  <div class="course-map">
    <div class="map-head">
      <strong>《数据结构与算法》课程图谱</strong>
      <span>12 章 · 80 知识单元骨架</span>
    </div>
    <div class="unit-row">
      <span
        v-for="unit in units"
        :key="unit.id"
        class="unit-pill"
        :class="{ active: activeUnit && activeUnit === unit.id }"
      >
        {{ unit.label }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeUnit: { type: String, default: '' }
})

const units = [
  { id: 'chapter_01_complexity', label: '复杂度' },
  { id: 'chapter_02_linear_structures', label: '线性表' },
  { id: 'chapter_03_recursion_divide_backtracking', label: '递归' },
  { id: 'chapter_04_sorting_searching', label: '排序' },
  { id: 'chapter_05_hash_heap_priority_queue', label: '哈希/堆' },
  { id: 'chapter_06_trees', label: '树' },
  { id: 'chapter_07_graph_traversal', label: '图遍历' },
  { id: 'chapter_08_shortest_path_mst', label: '路径/MST' },
  { id: 'chapter_09_greedy', label: '贪心' },
  { id: 'chapter_10_dynamic_programming', label: '动态规划' },
  { id: 'chapter_11_string_algorithms', label: '字符串' },
  { id: 'chapter_12_algorithm_project', label: '项目' }
]
</script>

<style scoped>
.course-map {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  background: #fff;
}
.map-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.map-head span {
  color: #6b7280;
  font-size: 12px;
}
.unit-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.unit-pill {
  padding: 5px 8px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #374151;
  font-size: 12px;
}
.unit-pill.active {
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
}
</style>
