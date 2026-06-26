<template>
  <div class="course-map">
    <div class="map-head">
      <strong>《深度学习》课程图谱</strong>
      <span>12 章 · 12 知识单元</span>
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
  { id: 'dl_intro_diagnosis', label: '导论' },
  { id: 'dl_prereq_math_ml', label: '前置' },
  { id: 'dl_nn_perceptron', label: 'MLP' },
  { id: 'dl_backprop_basic', label: '反传' },
  { id: 'dl_optimization_adam', label: '优化' },
  { id: 'dl_regularization_dropout_bn', label: '正则' },
  { id: 'dl_cnn_conv_basic', label: 'CNN' },
  { id: 'dl_rnn_lstm_gru', label: 'RNN' },
  { id: 'dl_transformer_attention', label: 'Transformer' },
  { id: 'dl_generative_intro', label: '生成' },
  { id: 'dl_pytorch_practice', label: 'PyTorch' },
  { id: 'dl_final_project', label: '项目' }
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
