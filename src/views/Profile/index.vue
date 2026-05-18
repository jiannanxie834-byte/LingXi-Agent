<template>
  <div class="profile-page">
    
    <div class="header-section">
      <div class="user-info">
        <div class="avatar">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
        </div>
        <div class="text-info">
          <h2>李同学 (计算机科学与技术)</h2>
          <p class="bio">"路漫漫其修远兮，吾将上下而求索。"</p>
          <div class="tags">
            <span class="tag">大二</span>
            <span class="tag">前端方向</span>
            <span class="tag">深度学习狂热粉</span>
          </div>
        </div>
      </div>
      <div class="action-btn">
        <button class="feedback-btn">问题反馈</button>
        <button class="logout-btn">退出登录</button>
      </div>
    </div>

    <div class="dashboard-grid">
      
      <div class="card radar-card">
        <div class="card-header">
          <h3>🧠 AI 动态学习画像</h3>
          <span class="update-time">刚刚随学随新</span>
        </div>
        <div ref="radarChartRef" class="radar-chart"></div>
      </div>

      <div class="right-column">
        
        <div class="card stats-card">
          <h3>📊 学习评估概览</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="num">128</span>
              <span class="label">累计学习(小时)</span>
            </div>
            <div class="stat-item">
              <span class="num">15</span>
              <span class="label">生成专属资源</span>
            </div>
            <div class="stat-item">
              <span class="num">92%</span>
              <span class="label">知识点掌握度</span>
            </div>
            <div class="stat-item">
              <span class="num">3</span>
              <span class="label">攻克易错点</span>
            </div>
          </div>
        </div>

        <div class="card AI-analysis">
          <h3>🤖 智能体学习建议</h3>
          <div class="analysis-content">
            <p><strong>认知风格：</strong> 偏向于“视觉-活跃型”。建议多使用系统生成的“多模态视频”和“思维导图”资源。</p>
            <p><strong>当前薄弱点：</strong> Vue3 组合式 API、计算机网络协议。</p>
            <p><strong>下一步规划：</strong> 已自动在【规划】页为您生成《Vue3 进阶突击路线》。</p>
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
// 引入 ECharts
import * as echarts from 'echarts'

// 获取 DOM 节点的引用
const radarChartRef = ref(null)
let chartInstance = null

// 组件挂载后初始化图表
onMounted(() => {
  chartInstance = echarts.init(radarChartRef.value)
  
  // 赛题要求的 6 个维度配置
  const option = {
    color: ['#1890ff'],
    tooltip: { trigger: 'item' },
    radar: {
      indicator: [
        { name: '知识基础', max: 100 },
        { name: '认知风格', max: 100 },
        { name: '易错点偏好', max: 100 },
        { name: '学习专注度', max: 100 },
        { name: '实践动手能力', max: 100 },
        { name: '自驱探索力', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#333', fontSize: 13, fontWeight: 500 },
      splitArea: {
        areaStyle: {
          color: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da'].reverse()
        }
      },
      axisLine: { lineStyle: { color: '#ced4da' } },
      splitLine: { lineStyle: { color: '#ced4da' } }
    },
    series: [
      {
        name: '动态画像',
        type: 'radar',
        data: [
          {
            value: [85, 90, 75, 88, 95, 80],
            name: '当前状态',
            areaStyle: { color: 'rgba(24, 144, 255, 0.3)' },
            lineStyle: { width: 2 }
          }
        ]
      }
    ]
  }
  
  chartInstance.setOption(option)

  // 监听窗口大小变化，让图表自适应缩放
  window.addEventListener('resize', () => {
    chartInstance.resize()
  })
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>

<style scoped>
.profile-page {
  padding: 24px;
  height: 100%;
  background-color: #f0f2f5;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 顶部用户信息区 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}
.avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f5f5f5;
  border: 2px solid #e8e8e8;
}
.text-info h2 {
  margin: 0 0 8px 0;
  color: #333;
}
.bio {
  color: #666;
  font-size: 14px;
  margin: 0 0 12px 0;
}
.tags {
  display: flex;
  gap: 8px;
}
.tag {
  background: #e6f7ff;
  color: #1890ff;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
}
.action-btn button {
  margin-left: 12px;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.feedback-btn {
  background: #f5f5f5;
  color: #333;
}
.logout-btn {
  background: #fff1f0;
  color: #f5222d;
}

/* 核心网格布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 左右平分 */
  gap: 24px;
}

/* 卡片通用样式 */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}
.card h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #333;
}

/* 雷达图区块 */
.radar-card {
  display: flex;
  flex-direction: column;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.card-header h3 {
  margin: 0;
}
.update-time {
  font-size: 12px;
  color: #52c41a;
  background: #f6ffed;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #b7eb8f;
}
.radar-chart {
  flex: 1;
  min-height: 350px;
  width: 100%;
}

/* 右侧栏布局 */
.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 数据统计区 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.stat-item {
  background: #fafafa;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #f0f0f0;
}
.stat-item .num {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 4px;
}
.stat-item .label {
  font-size: 13px;
  color: #666;
}

/* AI 建议区 */
.AI-analysis .analysis-content p {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin-bottom: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #1890ff;
}
</style>