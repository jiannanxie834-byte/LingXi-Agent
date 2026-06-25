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

    <div class="resource-toolbar">
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          clearable
          placeholder="搜索知识点、资源名称、来源或正文内容"
        />
        <span class="result-count">
          已筛选 {{ filteredResources.length }} / {{ sourceResourceCount }} 份
        </span>
      </div>
      <div class="upload-action-bar">
        <el-button type="primary" @click="openUploadDialog">+ 贡献/上传初始课程资源</el-button>
        <el-button type="warning" plain @click="handleProposeNewType">
          申请新资源分类
        </el-button>
      </div>
    </div>

    <el-empty 
      v-if="filteredResources.length === 0" 
      :description="emptyDescription" 
    />

    <div v-else class="resource-grid">
      
      <div v-for="item in filteredResources" :key="item.id" class="resource-card" :class="{ 'bundle-card': item.auto_bundle }">
        <div class="card-cover" :class="getCoverClass(item.type)">
          <span class="tag">{{ item.type }}</span>
        </div>
        <div class="card-info">
          <h3 :title="item.title">{{ item.title }}</h3>
          <p class="desc" v-if="item.auto_bundle">
            {{ item.resource_count || 0 }} 份资源 · {{ item.summary || '主题资源聚合视图' }}
          </p>
          <p class="desc" v-else>资源编码: {{ item.id }} · 状态: 正常开放</p>
          <div v-if="item.auto_bundle" class="bundle-type-row">
            <span v-for="child in (item.items || []).slice(0, 4)" :key="`${item.id}-${child.type}`">
              {{ child.type }}
            </span>
          </div>
          <div class="action-bar">
            <button class="view-btn" @click="handleView(item)">
              {{ item.auto_bundle ? '查看学习包' : '查阅资源' }}
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
          <el-input v-model="uploadForm.source" placeholder="如：人工智能第3章 / 官方文档 / 课堂讲义" />
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

    <el-dialog v-model="typeApplyVisible" title="申请新资源分类" width="460px" destroy-on-close>
      <el-form :model="typeApplyForm" label-width="86px" label-position="left">
        <el-form-item label="分类名称">
          <el-input
            v-model="typeApplyForm.name"
            maxlength="20"
            show-word-limit
            placeholder="如：阶段性模拟试卷"
            @keyup.enter="submitNewTypeApplication"
          />
        </el-form-item>
        <el-form-item label="申请说明">
          <el-input
            v-model="typeApplyForm.reason"
            type="textarea"
            :rows="3"
            maxlength="80"
            show-word-limit
            placeholder="说明这个分类适合承载哪些学习资源"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeApplyVisible = false">取消</el-button>
        <el-button type="primary" :loading="typeApplyLoading" @click="submitNewTypeApplication">
          提交申请
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="学习资源详情" width="760px" destroy-on-close>
      <div v-if="selectedResource && selectedResource.auto_bundle" class="resource-detail">
        <h3>{{ selectedResource.title }}</h3>
        <div class="detail-meta">
          <el-tag>主题学习包</el-tag>
          <span>{{ selectedResource.topic }}</span>
          <span>{{ selectedResource.resource_count || 0 }} 份资源</span>
        </div>
        <p class="summary">{{ selectedResource.summary }}</p>
        <div class="bundle-detail-list">
          <button
            v-for="child in selectedResource.items || []"
            :key="child.id"
            type="button"
            class="bundle-detail-item"
            @click="handleView(child)"
          >
            <span>{{ child.type }}</span>
            <strong>{{ child.title }}</strong>
            <em>{{ child.summary || '暂无摘要' }}</em>
          </button>
        </div>
      </div>
      <div v-else-if="selectedResource" class="resource-detail">
        <h3>{{ selectedResource.title }}</h3>
        <div class="detail-meta">
          <el-tag>{{ selectedResource.type }}</el-tag>
          <span>来源：{{ selectedResource.source || selectedResource.uploader || '课程资源库' }}</span>
        </div>
        <p class="summary">{{ selectedResource.summary || '暂无摘要' }}</p>
        <div v-if="selectedResource.safety_review && selectedResource.safety_review.risk_level" class="safety-note">
          <span>内容自检</span>
          <strong>{{ selectedResource.safety_review.risk_level }}</strong>
          <em>{{ selectedResource.safety_review.score }}分，已进入管理员审核链路</em>
        </div>
        <MarkdownRenderer :content="selectedResource.content || '暂无正文内容'" />
      </div>
      <template #footer>
        <el-button v-if="selectedResource && !selectedResource.auto_pushed && !selectedResource.auto_bundle" @click="downloadPptx(selectedResource)">导出PPT</el-button>
        <el-button type="primary" @click="detailVisible = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
//  引入接口：只拿通过审核的资源，以及前台上传接口
import {
  getPassedTypesAPI,
  getPassedResourcesAPI,
  getPassedResourceBundlesAPI,
  getRecommendedResourcesAPI,
  proposeTypeAPI,
  uploadResourceAPI
} from '@/api/resource'
import MarkdownRenderer from '@/components/MarkdownRenderer/index.vue'
import { useUserStore } from '@/stores/user'

const loading = ref(false)
const userStore = useUserStore()
const rawResources = ref([]) // 从后端拿到的全量“已通过”资源
const recommendedResources = ref([])
const resourceBundles = ref([])
const recommendLoadFailed = ref(false)
const searchKeyword = ref('')
const typeApplyVisible = ref(false)
const typeApplyLoading = ref(false)
const typeApplyForm = ref({
  name: '',
  reason: ''
})
const tabs = ref(['为你推荐', '全部'])
const currentTab = ref('为你推荐')

//  页面加载时，既拉取资源，也拉取动态分类
const fetchTypesAndResources = async () => {
  loading.value = true
  try {
    // 1. 从后端拿已经通过审核的动态分类
    const typeRes = await getPassedTypesAPI()
    if (typeRes && typeRes.code === 200) {
      tabs.value = Array.from(new Set([
        '为你推荐',
        '主题学习包',
        '全部',
        ...(typeRes.data || []).filter(item => item !== '多模态学习包')
      ]))
    }
    
    // 2. 拿通过的资源数据和个性化推荐数据，两类结果分别展示。
    const res = await getPassedResourcesAPI()
    if (res && res.code === 200) {
      rawResources.value = res.data || []
    }

    const bundleRes = await getPassedResourceBundlesAPI()
    if (bundleRes && bundleRes.code === 200) {
      resourceBundles.value = bundleRes.data || []
    }

    const recommendRes = await getRecommendedResourcesAPI(userStore.username || 'student', 12)
    if (recommendRes && recommendRes.code === 200) {
      recommendedResources.value = recommendRes.data || []
      recommendLoadFailed.value = false
    } else {
      recommendLoadFailed.value = true
      recommendedResources.value = []
      ElMessage.error(recommendRes?.message || '个性化推荐加载失败')
    }
  } catch (error) {
    recommendLoadFailed.value = true
    console.error(error)
    ElMessage.error('资源数据加载失败')
  } finally {
    loading.value = false
  }
}

const handleProposeNewType = () => {
  typeApplyForm.value = {
    name: '',
    reason: ''
  }
  typeApplyVisible.value = true
}

const submitNewTypeApplication = async () => {
  const newTypeName = typeApplyForm.value.name.trim()

  if (!newTypeName) {
    return ElMessage.warning('请填写资源分类名称')
  }
  if (tabs.value.includes(newTypeName)) {
    return ElMessage.warning('该分类已经存在')
  }

  typeApplyLoading.value = true
  try {
    const res = await proposeTypeAPI(
      newTypeName,
      userStore.username,
      typeApplyForm.value.reason.trim()
    )
    if (res && res.code === 200) {
      ElMessage.success('申请已提交后台！管理员通过后，本页面会自动出现该分类。')
      typeApplyVisible.value = false
    }
  } catch (error) {
    console.error('申请新分类失败:', error)
  } finally {
    typeApplyLoading.value = false
  }
}

onMounted(() => {
  fetchTypesAndResources()
})

const isRecommendTab = computed(() => currentTab.value === '为你推荐')
const isBundleTab = computed(() => currentTab.value === '主题学习包')

const sourceResources = computed(() => {
  if (isBundleTab.value) return resourceBundles.value
  if (!isRecommendTab.value) return rawResources.value
  return recommendedResources.value
})

const sourceResourceCount = computed(() => sourceResources.value.length)

const emptyDescription = computed(() => {
  if (searchKeyword.value) return '没有匹配到资源，换个关键词试试'
  if (isRecommendTab.value && recommendLoadFailed.value) return '个性化推荐加载失败，请检查后端推荐服务'
  if (isRecommendTab.value) return '当前画像和学习记录暂未匹配到推荐资源'
  return '该分类下暂无已放行的资源，去上传一份等待管理员审批吧~'
})

// 2. 核心计算属性：根据当前点击的 Tab，动态过滤要展示的卡片
const filteredResources = computed(() => {
  const aliases = {
    '专业课程讲解文档': ['专业课程讲解文档', '课程文档', '文档'],
    '知识点思维导图': ['知识点思维导图', '思维导图', '导图'],
    '不同类型练习题目': ['不同类型练习题目', '练习题目', '练习题', '题库', '试卷'],
    '拓展阅读材料': ['拓展阅读材料', '拓展阅读', '阅读材料'],
    '主题学习包': ['主题学习包', '资源包', '学习包'],
    '错题诊断与学习反馈报告': ['错题诊断与学习反馈报告', '错题诊断', '学习反馈', '诊断报告', '反馈报告'],
    '学科实践应用任务': ['学科实践应用任务', '实践应用', '应用任务', '实践任务', '项目案例', '实验探究', '材料分析', '写作任务', '代码类实操案例', '实操案例', '代码案例']
  }
  const matchTypes = aliases[currentTab.value] || [currentTab.value]
  const keyword = searchKeyword.value.trim().toLowerCase()

  return sourceResources.value.filter(item => {
    const itemType = item.type || ''
    const typeMatched = isRecommendTab.value || isBundleTab.value || currentTab.value === '全部'
      ? true
      : matchTypes.some(type => itemType.includes(type) || type.includes(itemType))

    if (!typeMatched) return false
    if (!keyword) return true

    const searchableText = [
      item.id,
      item.title,
      item.type,
      item.summary,
      item.source,
      item.uploader,
      item.content,
      item.topic,
      ...(item.items || []).flatMap(child => [child.title, child.type, child.summary])
    ].join('\n').toLowerCase()

    return searchableText.includes(keyword)
  })
})

const handleTabClick = (tab) => {
  currentTab.value = tab
}

//  3. 根据不同的资源类型，动态赋予你之前写好的高级渐变色封面样式
const getCoverClass = (type) => {
  if (type.includes('主题学习包') || type.includes('学习包')) return 'bundle-cover'
  if (type.includes('导图')) return 'mindmap-cover'
  if (type.includes('文档')) return 'doc-cover'
  if (type.includes('诊断') || type.includes('反馈')) return 'feedback-cover'
  if (type.includes('实践') || type.includes('应用')) return 'practice-cover'
  return 'generic-cover'
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
    const res = await uploadResourceAPI({
      ...uploadForm.value,
      username: userStore.username
    })
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
  selectedResource.value = item.auto_bundle
    ? item
    : rawResources.value.find(resource => resource.id === item.id) || recommendedResources.value.find(resource => resource.id === item.id) || item
  detailVisible.value = true
}

const downloadPptx = (item) => {
  if (!item?.id) return
  window.open(`/api/resource/export/pptx/${encodeURIComponent(item.id)}`, '_blank')
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
  flex-wrap: wrap;
  justify-content: flex-end;
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

.resource-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
  max-width: 600px;
}

.search-box :deep(.el-input) {
  max-width: 420px;
}

.result-count {
  flex-shrink: 0;
  color: #6b7280;
  font-size: 13px;
}

.upload-action-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
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
.bundle-card {
  border: 1px solid #dbeafe;
}

/* 卡片封面 */
.card-cover {
  height: 140px;
  padding: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
/* 唯美渐变色 */
.mindmap-cover { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
.doc-cover { background: linear-gradient(135deg, #ffd194 0%, #70e1f5 100%); }
.feedback-cover { background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); }
.practice-cover { background: linear-gradient(135deg, #fddb92 0%, #d1fdff 100%); }
.bundle-cover { background: linear-gradient(135deg, #bfdbfe 0%, #bbf7d0 100%); }
.generic-cover { background: linear-gradient(135deg, #dbeafe 0%, #e5e7eb 100%); }

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
.bundle-type-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.bundle-type-row span {
  padding: 3px 7px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
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
.safety-note {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin: 12px 0;
  padding: 8px 10px;
  border-radius: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  font-size: 12px;
}
.safety-note em {
  color: #4b5563;
  font-style: normal;
}
.bundle-detail-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}
.bundle-detail-item {
  display: grid;
  grid-template-columns: 138px minmax(0, 1fr);
  gap: 6px 12px;
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  text-align: left;
  cursor: pointer;
}
.bundle-detail-item:hover {
  border-color: #93c5fd;
  background: #f8fbff;
}
.bundle-detail-item span {
  grid-row: span 2;
  align-self: start;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}
.bundle-detail-item strong {
  min-width: 0;
  font-size: 14px;
}
.bundle-detail-item em {
  color: #6b7280;
  font-size: 12px;
  font-style: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .filter-header,
  .resource-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .category-tabs,
  .upload-action-bar {
    justify-content: flex-start;
  }

  .search-box {
    max-width: none;
    flex-wrap: wrap;
  }

  .search-box :deep(.el-input) {
    max-width: none;
  }

}
</style>
