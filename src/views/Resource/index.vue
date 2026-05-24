<template>
  <div class="resource-page" v-loading="loading">
    
    <div class="filter-header">
      <h2 class="page-title">高校初始知识库 / 资源库</h2>
      
      <div class="category-tabs">
        <div 
          v-for="tab in tabs" 
          :key="tab" 
          class="tab" 
          :class="{ active: currentTab === tab }"
          @click="handleTabClick(tab)"
        >
          {{ tab }}
        </div>
      </div>
    </div>

    <div class="upload-action-bar" style="margin-bottom: 20px;">
      <el-button type="primary" @click="openUploadDialog">+ 贡献/上传初始课程资源</el-button>
      <el-button type="warning" plain @click="handleProposeNewType">
         申请新资源分类
      </el-button>
    </div>

    <el-empty 
      v-if="filteredResources.length === 0" 
      description="该分类下暂无已放行的资源，去上传一份等待管理员审批吧~" 
    />

    <div v-else class="resource-grid">
      
      <div v-for="item in filteredResources" :key="item.id" class="resource-card">
        <div class="card-cover" :class="getCoverClass(item.type)">
          <span class="tag">{{ item.type }}</span>
        </div>
        <div class="card-info">
          <h3 :title="item.title">{{ item.title }}</h3>
          <p class="desc">资源编码: {{ item.id }} · 状态: 正常开放</p>
          <div class="action-bar">
            <button class="view-btn" @click="handleView(item)">
              查阅资源
            </button>
          </div>
        </div>
      </div>

    </div>

    <el-dialog v-model="uploadVisible" title="贡献初始知识库资源" width="400px" destroy-on-close>
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="资源名称">
          <el-input v-model="uploadForm.title" placeholder="如：Vue3组合式API进阶演练.pdf" />
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select v-model="uploadForm.type" placeholder="请选择资源类型" style="width: 100%;">
            <el-option label="专业课程讲解文档" value="专业课程讲解文档" />
            <el-option label="知识点思维导图" value="知识点思维导图" />
            <el-option label="不同类型练习题目" value="不同类型练习题目" />
            <el-option label="拓展阅读材料" value="拓展阅读材料" />
            <el-option label="错题诊断与学习反馈报告" value="错题诊断与学习反馈报告" />
            <el-option label="学科实践应用任务" value="学科实践应用任务" />
          </el-select>
        </el-form-item>
        <el-form-item label="资源摘要">
          <el-input v-model="uploadForm.summary" placeholder="简要说明这份资源适合解决什么学习问题" />
        </el-form-item>
        <el-form-item label="知识来源">
          <el-input v-model="uploadForm.source" placeholder="如：人工智能导论第3章 / 官方文档 / 课堂讲义" />
        </el-form-item>
        <el-form-item label="资源正文">
          <el-input
            v-model="uploadForm.content"
            type="textarea"
            :rows="6"
            placeholder="支持 Markdown，可填写讲解、题目、实践任务或诊断报告"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUpload">确认上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="学习资源详情" width="760px" destroy-on-close>
      <div v-if="selectedResource" class="resource-detail">
        <h3>{{ selectedResource.title }}</h3>
        <div class="detail-meta">
          <el-tag>{{ selectedResource.type }}</el-tag>
          <span>来源：{{ selectedResource.source || selectedResource.uploader || '课程资源库' }}</span>
        </div>
        <p class="summary">{{ selectedResource.summary || '暂无摘要' }}</p>
        <MarkdownRenderer :content="selectedResource.content || '暂无正文内容'" />
      </div>
      <template #footer>
        <el-button type="primary" @click="detailVisible = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
//  引入接口：只拿通过审核的资源，以及前台上传接口
import { getPassedTypesAPI, getPassedResourcesAPI, proposeTypeAPI, uploadResourceAPI } from '@/api/resource'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'

const loading = ref(false)
const rawResources = ref([]) // 从后端拿到的全量“已通过”资源

const tabs = ref(['全部']) // 初始只有全部
const currentTab = ref('全部')

//  页面加载时，既拉取资源，也拉取动态分类
const fetchTypesAndResources = async () => {
  loading.value = true
  try {
    // 1. 从后端拿已经通过审核的动态分类
    const typeRes = await getPassedTypesAPI()
    if (typeRes && typeRes.code === 200) {
      tabs.value = ['全部', ...typeRes.data] // 把后端给的 6 种以上类型动态拼到全部后面
    }
    
    // 2. 拿通过的资源数据
    const res = await getPassedResourcesAPI()
    if (res && res.code === 200) {
      rawResources.value = res.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

//  在“贡献上传资源”弹窗旁边，还可以再加一个小按钮：【申请新分类】
const handleProposeNewType = async () => {
  const newTypeName = prompt('请输入你想申请的新资源分类名称 (如: 阶段性模拟试卷):')
  if (!newTypeName || !newTypeName.trim()) return
  
  const res = await proposeTypeAPI(newTypeName.trim())
  if (res && res.code === 200) {
    ElMessage.success('申请已提交后台！等管理员同意后，本页面的 Tab 栏会自动多出这一项！')
  }
}

onMounted(() => {
  fetchTypesAndResources()
})

// 2. 核心计算属性：根据当前点击的 Tab，动态过滤要展示的卡片
const filteredResources = computed(() => {
  if (currentTab.value === '全部') {
    return rawResources.value
  }
  const aliases = {
    '专业课程讲解文档': ['专业课程讲解文档', '课程文档', '文档'],
    '知识点思维导图': ['知识点思维导图', '思维导图', '导图'],
    '不同类型练习题目': ['不同类型练习题目', '练习题目', '练习题', '题库', '试卷'],
    '拓展阅读材料': ['拓展阅读材料', '拓展阅读', '阅读材料'],
    '错题诊断与学习反馈报告': ['错题诊断与学习反馈报告', '错题诊断', '学习反馈', '诊断报告', '反馈报告'],
    '学科实践应用任务': ['学科实践应用任务', '实践应用', '应用任务', '实践任务', '项目案例', '实验探究', '材料分析', '写作任务', '代码类实操案例', '实操案例', '代码案例']
  }
  const matchTypes = aliases[currentTab.value] || [currentTab.value]
  return rawResources.value.filter(item => {
    return matchTypes.some(type => item.type.includes(type) || type.includes(item.type))
  })
})

const handleTabClick = (tab) => {
  currentTab.value = tab
}

//  3. 根据不同的资源类型，动态赋予你之前写好的高级渐变色封面样式
const getCoverClass = (type) => {
  if (type.includes('导图')) return 'mindmap-cover'
  if (type.includes('文档')) return 'doc-cover'
  if (type.includes('诊断') || type.includes('反馈')) return 'feedback-cover'
  if (type.includes('实践') || type.includes('应用')) return 'practice-cover'
  return 'mindmap-cover' // 默认兜底
}

//  4. 前台贡献上传资源逻辑
const uploadVisible = ref(false)
const uploadForm = ref({ title: '', type: '' })
const detailVisible = ref(false)
const selectedResource = ref(null)

const openUploadDialog = () => {
  uploadForm.value = { title: '', type: '', summary: '', source: '', content: '' }
  uploadVisible.value = true
}

const submitUpload = async () => {
  if (!uploadForm.value.title.trim() || !uploadForm.value.type) {
    return ElMessage.warning('请将资源名称和类型填写完整')
  }
  try {
    const res = await uploadResourceAPI(uploadForm.value)
    if (res && res.code === 200) {
      ElMessage.success('上传成功！已送往管理后台进行合规性审核，通过后会自动在此展现。')
      uploadVisible.value = false
      // 注意：这里不需要调 fetchPassedResources()，因为刚上传的是“待审核”，前台不能直接展示
    }
  } catch (error) {
    console.error('上传失败:', error)
  }
}


// 点击查看按钮
const handleView = (item) => {
  selectedResource.value = item
  detailVisible.value = true
}
</script>

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
  user-select: none;
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

/* 网格布局：自适应列数 */
.resource-grid {
  display: grid;
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
/* 唯美渐变色 */
.mindmap-cover { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
.doc-cover { background: linear-gradient(135deg, #ffd194 0%, #70e1f5 100%); }
.feedback-cover { background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); }
.practice-cover { background: linear-gradient(135deg, #fddb92 0%, #d1fdff 100%); }

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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.resource-detail h3 { margin: 0 0 12px; color: #1f2937; }
.detail-meta { display: flex; align-items: center; gap: 10px; color: #6b7280; margin-bottom: 14px; }
.summary { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; color: #374151; line-height: 1.7; }
</style>
