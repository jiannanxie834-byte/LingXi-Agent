<template>
  <div class="interactive-card">
    <strong>{{ title }}</strong>
    <ConvolutionAnimation v-if="type === 'cnn_convolution'" :spec="spec" />
    <BackpropagationAnimation v-else-if="type === 'backpropagation_flow'" :spec="spec" />
    <AttentionAnimation v-else-if="type === 'attention_flow'" :spec="spec" />
    <LSTMGateAnimation v-else-if="type === 'lstm_gate_flow'" :spec="spec" />
    <pre v-else>{{ spec }}</pre>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ConvolutionAnimation from './ConvolutionAnimation.vue'
import BackpropagationAnimation from './BackpropagationAnimation.vue'
import AttentionAnimation from './AttentionAnimation.vue'
import LSTMGateAnimation from './LSTMGateAnimation.vue'

const props = defineProps({ artifact: { type: Object, default: () => ({}) } })
const spec = computed(() => props.artifact.spec || props.artifact.content?.spec || props.artifact)
const type = computed(() => spec.value.animation_type || '')
const title = computed(() => props.artifact.title || '交互动画')
</script>

<style scoped>
.interactive-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px;
  display: grid;
  gap: 10px;
}
pre { white-space: pre-wrap; background: #f8fafc; padding: 10px; border-radius: 8px; }
</style>
