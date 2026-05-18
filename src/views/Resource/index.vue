<template>
  <div class="resource-page">
    
    <div class="filter-header">
      <h2 class="page-title">我的专属资源库</h2>
      <div class="category-tabs">
        <div class="tab active">全部</div>
        <div class="tab">思维导图</div>
        <div class="tab">课程文档</div>
        <div class="tab">多模态视频</div>
        <div class="tab">实操案例</div>
      </div>
    </div>

    <div class="resource-grid">
      
      <div class="resource-card">
        <div class="card-cover mindmap-cover">
          <span class="tag">思维导图</span>
        </div>
        <div class="card-info">
          <h3>Vue3 响应式原理图解</h3>
          <p class="desc">由图谱智能体于 10 分钟前生成</p>
          <div class="action-bar">
            <button class="view-btn">查看</button>
          </div>
        </div>
      </div>

      <div class="resource-card">
        <div class="card-cover doc-cover">
          <span class="tag">课程文档</span>
        </div>
        <div class="card-info">
          <h3>JavaScript 闭包深度剖析</h3>
          <p class="desc">针对你的易错点定制生成</p>
          <div class="action-bar">
            <button class="view-btn">阅读</button>
          </div>
        </div>
      </div>
      
      <div class="resource-card">
        <div class="card-cover video-cover">
          <span class="tag">多模态视频</span>
        </div>
        <div class="card-info">
          <h3>虚拟数字人：算法基础讲解</h3>
          <p class="desc">科大讯飞多模态大模型生成</p>
          <div class="action-bar">
            <button class="view-btn">播放</button>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<style scoped>
.resource-page {
  padding: 24px;
  height: 100%;
  background-color: #f7f8fa;
  box-sizing: border-box;
  overflow-y: auto;
}

/* 顶部过滤栏 */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-title {
  margin: 0;
  font-size: 20px;
  color: #333;
}
.category-tabs {
  display: flex;
  gap: 12px;
}
.tab {
  padding: 6px 16px;
  border-radius: 20px;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #e5e5e5;
  transition: all 0.2s;
}
.tab:hover {
  border-color: #1890ff;
  color: #1890ff;
}
.tab.active {
  background: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

/* 网格布局：自适应列数，极其强大 */
.resource-grid {
  display: grid;
  /* 核心魔法：卡片最小 280px，空间足够就自动增加列数 */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* 卡片样式 */
.resource-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}
.resource-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

/* 卡片封面 */
.card-cover {
  height: 140px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
}
/* 用渐变色模拟不同类型的封面背景 */
.mindmap-cover { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
.doc-cover { background: linear-gradient(135deg, #ffd194 0%, #70e1f5 100%); }
.video-cover { background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%); }

.tag {
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

/* 卡片信息区 */
.card-info {
  padding: 16px;
}
.card-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}
.desc {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #999;
}
.action-bar {
  display: flex;
  justify-content: flex-end;
}
.view-btn {
  padding: 6px 16px;
  border-radius: 6px;
  background: #f0f7ff;
  color: #1890ff;
  border: none;
  cursor: pointer;
  font-weight: 500;
}
.view-btn:hover {
  background: #1890ff;
  color: #fff;
}
</style>