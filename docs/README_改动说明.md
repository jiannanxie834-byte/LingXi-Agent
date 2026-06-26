# 灵析学伴改动说明

本文档说明当前版本相对于最初版本的主线变化，涉及两个仓库：

- 前端：`LingXi-Agent`
- 后端：`LingXi-Backend`

## 一、产品定位调整

系统已从通用学习资源平台，收敛为面向高校《深度学习》课程的个性化多模态资源生成与学习多智能体系统。

当前主线不再对任意学科生成套模板资源。学生可以提出 CNN、反向传播、优化算法、正则化、RNN/LSTM/GRU、Transformer、生成模型、PyTorch 实验、课程项目等深度学习课程相关需求；课程外主题会被识别为范围外并提示换成课程内知识点。

## 二、课程知识库与课程图谱

后端新增《深度学习》课程知识库：

```text
data/knowledge_base/deep_learning/
  manifest.json
  knowledge_units.jsonl
  video_catalog.json
  references.json
  chapters/
  labs/
```

课程图谱包含 12 个章节和 12 个知识单元，覆盖从神经网络基础到课程项目的完整学习链路。系统会把学生输入映射到具体章节和知识单元，再决定是否生成学习路线与资源。

## 三、资源体系改造

系统不再把“总包型多模态资源”作为平级资源生成。多模态由同一主题下的多个具体 Artifact 组合呈现，再由主题学习包聚合展示。

当前允许生成的 Artifact 类型包括：

| Artifact | 作用 |
|---|---|
| 课程讲解文档 | 解释概念、公式、流程、例子和易错点 |
| 知识点思维导图 | 梳理章节关系、前置知识和核心概念连接 |
| 练习题集 | 覆盖选择、判断、简答、计算、代码补全、实验分析等题型 |
| 拓展阅读包 | 整理教材章节、公开课入口、官方文档和阅读顺序 |
| PyTorch 实操案例 | 提供实验目标、依赖、模型、代码、运行方式和报告模板 |
| PPT 大纲 | 生成可转课件的页面结构和讲解顺序 |
| 外部公开视频推荐卡 | 推荐公开原始链接、观看重点和学习任务 |
| 个性化视频观看指南 | 根据画像给出观看顺序、暂停点和复盘任务 |
| 交互动画规格 | 输出前端可渲染的结构化动画规格 |
| 动画分镜 | 给出演示动画的镜头、字幕和关键步骤 |
| 课程实践项目任务书 | 设计数据集、技术路线、任务拆解、验收标准和评分 Rubric |
| 诊断与补弱报告 | 仅在存在评价、错题、测验等真实反馈上下文时生成 |

## 四、多智能体链路

当前后端链路按以下方式协作：

```text
Conversation Router
-> 意图识别 Agent
-> 语义接地与课程图谱匹配
-> 知识检索 Agent
-> 画像建模 Agent
-> 学习辅导 Agent
-> 路径规划 Agent
-> 资源设计 Agent
-> 教学资料筛选 Agent
-> 内容安全与防幻觉门禁
-> 教师审核
-> 学生资源工厂展示
```

学生端只展示最终学习建议、学习路线和资源状态，不展示 Agent 原始输出、知识库全文、推荐分数、内部 trace 或调试字段。

## 五、前端体验调整

- 学生端标题、资源页、规划页和登录页统一为《深度学习》课程主线。
- 资源入口改为“深度学习资源工厂”。
- 资源上传和筛选改为新的 Artifact 类型。
- 管理端资源审核围绕 Artifact 审核和分类审核组织。
- 普通学生对话不显示内部处理链路；只在需要时展示轻量状态。

## 六、质量门禁

后端已加入面向《深度学习》课程的资源质量门禁：

- 必须命中课程图谱并绑定 `chapter_id` 与 `unit_id`。
- 课程外主题不得生成路径和资源。
- 练习题必须考查知识点本身，不得把学习路径规划误生成题目。
- 视频资源只允许提供公开原始链接、观看重点和学习任务，不复制、不下载、不重托管。
- 动画资源输出可渲染规格或分镜，不承诺自动生成 MP4。
- 学生水平未确认时，不得无证据写成进阶、高阶或已经掌握。
- 诊断与补弱报告必须有真实评价、错题或测验反馈上下文。

## 七、运行检查

后端：

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Backend
source .venv/bin/activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

前端：

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Agent
npm run dev
```

构建与语法检查：

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Backend
PYTHONPYCACHEPREFIX=/private/tmp/lingxi_pycache .venv/bin/python -m compileall app scripts

cd /Users/rinko/Documents/软件杯/LingXi-Agent
npm run build
```
