<template>
  <div class="interactive-card">
    <strong>{{ title }}</strong>
    <SortAnimation v-if="type === 'sort_animation'" :animation_spec="spec" />
    <BinarySearchAnimation v-else-if="type === 'binary_search_animation'" :animation_spec="spec" />
    <RecursionStackAnimation v-else-if="type === 'recursion_call_stack'" :animation_spec="spec" />
    <BacktrackingTreeAnimation v-else-if="type === 'backtracking_tree'" :animation_spec="spec" />
    <TreeTraversalAnimation v-else-if="type === 'tree_traversal_animation'" :animation_spec="spec" />
    <GraphTraversalAnimation v-else-if="type === 'bfs_dfs_graph_animation'" :animation_spec="spec" />
    <DijkstraAnimation v-else-if="type === 'dijkstra_relaxation_animation'" :animation_spec="spec" />
    <UnionFindAnimation v-else-if="type === 'mst_union_find_animation'" :animation_spec="spec" />
    <DpTableAnimation v-else-if="type === 'dp_table_animation'" :animation_spec="spec" />
    <KmpAnimation v-else-if="type === 'kmp_prefix_animation'" :animation_spec="spec" />
    <HeapAnimation v-else-if="type === 'heap_operation_animation'" :animation_spec="spec" />
    <AlgorithmAnimationPlaceholder v-else :spec="spec" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AlgorithmAnimationPlaceholder from './algorithms/AlgorithmAnimationPlaceholder.vue'
import SortAnimation from './algorithms/SortAnimation.vue'
import BinarySearchAnimation from './algorithms/BinarySearchAnimation.vue'
import RecursionStackAnimation from './algorithms/RecursionStackAnimation.vue'
import BacktrackingTreeAnimation from './algorithms/BacktrackingTreeAnimation.vue'
import TreeTraversalAnimation from './algorithms/TreeTraversalAnimation.vue'
import GraphTraversalAnimation from './algorithms/GraphTraversalAnimation.vue'
import DijkstraAnimation from './algorithms/DijkstraAnimation.vue'
import UnionFindAnimation from './algorithms/UnionFindAnimation.vue'
import DpTableAnimation from './algorithms/DpTableAnimation.vue'
import KmpAnimation from './algorithms/KmpAnimation.vue'
import HeapAnimation from './algorithms/HeapAnimation.vue'

const props = defineProps({ artifact: { type: Object, default: () => ({}) } })
const spec = computed(() => props.artifact.spec || props.artifact.content?.spec || props.artifact)
const type = computed(() => spec.value.animation_type || '')
const title = computed(() => props.artifact.title || '算法可视化动画')
</script>

<style scoped>
.interactive-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  display: grid;
  gap: 10px;
}
</style>
