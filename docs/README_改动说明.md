# 灵析学伴改动说明

本文档说明本次相对于最初版本的主要改动，涉及两个仓库：

- 前端：`LingXi-Agent`
- 后端：`LingXi-Backend`

对应提交：

- 前端：`a954cee feat: add agent learning workflow`、`dc73bfb feat: rename practice resource type`
- 后端：`6f9e951 feat: add multi-agent backend workflow`、`54b2880 feat: support cross-subject practice tasks`

## 一、整体变化

最初版本主要是一个前端页面和后端基础接口框架，部分页面数据偏静态，学习助手、多智能体资源生成、学习路径、资源审核和评价反馈之间还没有形成完整闭环。

本次改动后，系统形成了比较完整的业务链路：

```text
学生提问
-> 多智能体分析学习意图和学生画像
-> 检索课程知识库依据
-> 生成 7 类个性化资源
-> 资源进入管理员审核队列
-> 同步生成个性化学习路线
-> 学生学习后可自动进行学习评价
-> 评价结果生成诊断报告和补弱路线
```

## 二、资源类型重新规划

资源类型从偏计算机课程的设计，调整为更通用的“讲、图、练、读、包、评、做”结构：

| 类型 | 作用 |
|---|---|
| 专业课程讲解文档 | 讲清概念、原理和学习目标 |
| 知识点思维导图 | 梳理知识结构、易错点和学习路径 |
| 不同类型练习题目 | 用判断题、应用题、开放题检测掌握情况 |
| 拓展阅读材料 | 推荐延伸阅读和学习记录模板 |
| 多模态学习包 | 同一知识点输出文字、流程图、代码注释、题解、PPT 页纲和实践任务 |
| 错题诊断与学习反馈报告 | 分析薄弱点、错因和补救建议 |
| 学科实践应用任务 | 将知识迁移到真实任务或综合场景中 |

原来的“多模态教学视频/动画”已调整为“多模态学习包”，避免系统承诺实时生成视频，同时保留多表达形态。  
原来的“代码类实操案例”已升级为“学科实践应用任务”，避免系统只适配计算机学科。

## 三、跨学科实践任务适配

最后一类“学科实践应用任务”不是简单改名，而是根据学科自动生成不同形式的实践任务：

| 学科 | 实践任务形式 |
|---|---|
| 计算机/Vue/Python | 小功能实现、代码项目、数据处理任务 |
| 计算机网络 | 抓包实验、协议字段标注、网络现象解释 |
| 高等数学 | 建模分析、变量设定、求解过程、结论解释 |
| 大学物理 | 实验设计、数据记录、图像分析、误差说明 |
| 大学英语 | 阅读批注、关键词整理、短文改写、表达修改 |
| 历史与思政 | 材料分析、观点论证、论据链整理 |

这样“练习题目”负责检测，“学科实践应用任务”负责迁移应用，两者不重复。

## 四、前端主要改动

### 1. 首页对话接入真实后端

- 首页不再只模拟回复。
- 新增 `src/api/chat.js`。
- 调用后端 `/api/chat/send` 获取多智能体结果。
- 对话结果支持 Markdown 渲染。
- 对话结果展示多智能体处理链路、知识库依据和内容安全摘要。
- 对话历史会保存处理链路与依据，刷新后仍可回看。
- 对话后会更新学生画像、学习标签和学习时长。

### 2. 新增学习评价页面

- 新增 `src/views/Evaluation/index.vue`。
- 新增 `src/api/evaluation.js`。
- 底部导航新增“评价”入口。
- 页面主流程是“平台数据自动诊断”。
- 手动输入被弱化为折叠项“补充线下错题 / 特殊卡点”，用于补充平台外学习数据。

### 3. 资源库页面升级

- 资源类型改为新的 7 类。
- 资源详情支持摘要、来源、正文。
- 支持 Markdown 展示资源内容。
- 上传资源时可填写摘要、来源、正文。
- 前端过滤旧的视频/动画类型和旧代码类型。
- 新增关键词检索，可按资源名、知识点、来源、正文和资源编码筛选。

### 4. 规划页面修复

- 学习路线可以保存。
- 删除路线、编辑任务状态和删除任务后会保存。
- 自建路线、插入任务、添加待办统一使用 Element Plus 弹窗，不再使用浏览器默认 `prompt/confirm`。
- 学生手动调整任务状态后会同步到后端。

### 5. 管理端体验修复

- 管理员登录后跳转管理后台。
- 管理员路由权限守卫补齐。
- 资源审核、反馈处理后状态实时刷新。
- 管理端资源详情弹窗支持查看正文、来源和 Agent 说明。

### 6. Markdown 安全处理

- Markdown 渲染禁用 HTML，降低资源正文中注入 HTML 的风险。

## 五、后端主要改动

### 1. 新增多智能体服务

多智能体由 `app/agents/` 与 `app/services/data_services/orchestrator_service.py` 协同完成，包含：

- 画像分析 Agent
- 知识检索 Agent
- 资源生成 Agent
- 实践应用 Agent
- 路径规划 Agent
- 大模型教学 Agent
- 安全校验 Agent
- 知识库依据检索 Agent

新增接口：

```text
POST /api/chat/send
GET  /api/resource/evidence/search
```

### 2. 新增学习评价与错题诊断

新增 `app/routers/evaluation.py`。

新增接口：

```text
POST /api/evaluation/auto
POST /api/evaluation/submit
GET  /api/evaluation/history
```

功能：

- 根据平台数据自动诊断学习情况。
- 自动生成诊断分数、掌握等级、薄弱点和补救建议。
- 自动生成诊断报告，进入管理员审核队列。
- 低分时自动生成补弱路线。
- 支持学生补充线下错题或特殊卡点。

### 3. 资源系统升级

资源表新增字段：

```text
summary
content
source
agent_notes
```

作用：

- `summary`：资源摘要
- `content`：Markdown 正文
- `source`：知识来源
- `agent_notes`：Agent 生成说明和审核提示

### 4. 学习路线持久化

新增 `learning_plans` 表。

原来学习路线主要依赖运行期内存，现在改为写入数据库。  
后端重启后，学生规划路线不会丢失。

### 5. 学习评价记录持久化

新增 `evaluation_records` 表，用于保存：

- 学生账号
- 评价主题
- 诊断分数
- 掌握等级
- 薄弱点
- 补救建议
- 学生补充说明
- 自动诊断使用的数据摘要

### 6. 大模型接入预留

新增 `app/services/llm_provider.py`。

支持通过 `.env` 配置讯飞星火 HTTP 接口：

```text
LINGXI_LLM_PROVIDER=spark
SPARK_API_URL=https://spark-api-open.xf-yun.com/v1/chat/completions
SPARK_MODEL=lite
SPARK_API_PASSWORD=你的 APIPassword
```

当前版本要求配置可用的大模型 Key。大模型调用失败时，系统会明确返回错误原因，不再用本地模板假装生成成功，避免演示时出现“看起来回答了但实际没有识别/生成”的误导。

### 7. 工程化清理

- 前端删除旧空页面、旧空组件、旧 store 和未使用 API 封装。
- 后端去掉默认完整 LLM prompt 打印，改为 `LINGXI_DEBUG_LLM=1` 控制调试日志。
- 学习规划服务取消运行期内存缓存，统一读写 MySQL，避免状态不一致。
- 清理旧补丁包、Python 缓存和系统临时文件。

## 六、数据库说明

本项目当前演示配置已经切换为 MySQL：

```text
DATABASE_URL=mysql+pymysql://root@127.0.0.1:3306/lingxi?charset=utf8mb4
```

历史 SQLite 文件 `lingxi.db` 保留为本地备用/旧测试文件，不作为当前正式演示数据源。

## 七、2026-06-23 当前未提交改动

### 1. 学生端资源推荐改为隐式机制

- 学生资源库保留“为你推荐”入口，但不再展示推荐分数。
- 资源卡片不再展示“命中标签”“推荐原因”等内部依据。
- 资源详情弹窗不再展示“个性化推荐指数”“命中标签”“推荐理由列表”。
- 前端仍然调用推荐接口，资源排序和筛选由系统隐藏完成。
- 这样更接近真实产品体验：学生看到的是被推荐的学习资料，不需要看到算法解释过程。

### 2. 后端推荐接口收口

- 推荐算法内部仍计算排序分，用 `_recommend_rank` 作为临时字段。
- 排序完成后会删除 `_recommend_rank`，接口返回中不暴露内部推荐分。
- 接口不再返回 `recommend_score`、`recommend_reasons`、`recommend_breakdown`、`matched_tags`。
- 删除了不再使用的推荐理由拼接函数，避免代码层继续维护显式推荐文案。

### 3. 已验证内容

- 前端构建通过：

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Agent
npm run build
```

- 后端语法编译通过：

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Backend
PYTHONPYCACHEPREFIX=/private/tmp/lingxi_pycache .venv/bin/python -m compileall app
```

### 4. 建议人工测试路径

1. 启动后端：

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Backend
source .venv/bin/activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

2. 启动前端：

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Agent
npm run dev
```

3. 学生端登录后进入“资源”页。
4. 默认进入“为你推荐”分类，确认能看到推荐资源卡片。
5. 检查资源卡片：只展示资源类型、资源标题、资源编码和“查阅资源”，不出现推荐分数、命中标签、推荐原因。
6. 点击“查阅资源”进入详情，确认详情中只展示资源类型、来源、摘要、安全自检和正文，不出现推荐指数、命中标签、推荐理由。
7. 切换“全部”和其他资源分类，确认资源列表和搜索功能正常。
8. 打开浏览器开发者工具 Network，查看 `/api/resource/recommendations` 响应，确认单条资源中没有 `recommend_score`、`recommend_reasons`、`recommend_breakdown`、`matched_tags`、`_recommend_rank`。

本次代码会自动补齐新增字段和新表：

- `resources` 表新增摘要、正文、来源、Agent 说明字段。
- 新增 `learning_plans` 表。
- 新增 `evaluation_records` 表。
- 新增 `chat_sessions`、`chat_messages` 对话持久化表。
- `chat_messages` 新增 `metadata_json`，保存链路、依据和安全摘要。

注意：

- `.env` 不提交到 GitHub，避免泄露模型 Key 和数据库配置。
- `lingxi.db` 是旧 SQLite 文件，不建议提交。
- 当前新建用户、聊天、评价、资源审核数据写入 MySQL 的 `lingxi` 数据库。

## 七、运行方式

### 后端

进入后端仓库：

```bash
cd LingXi-Backend
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 前端

进入前端仓库：

```bash
cd LingXi-Agent
npm install
npm run dev
```

前端默认请求：

```text
http://127.0.0.1:8000/api
```

所以建议先启动后端，再启动前端。

## 八、验证过的内容

已验证：

- 后端 `python -m compileall app` 通过。
- 前端 `npm run build` 通过。
- 首页对话接口可用。
- 自动学习诊断接口可用。
- 学习评价历史接口可用。
- 学习路线持久化可用。
- 资源类型接口返回新的 7 类资源。
- 聊天接口返回知识库依据，并可在历史消息中恢复。
- 管理员控制台演示就绪检查可用。
- 英语类问题可以生成“阅读批注/短文改写”实践任务，而不是代码任务。

## 九、答辩时可以这样介绍

系统不是简单聊天机器人，而是一个“学习前、学习中、学习后”闭环系统：

```text
学习前：通过对话分析学生画像和学习目标
学习中：检索课程知识库依据，生成讲解文档、思维导图、练习题、拓展阅读、多模态学习包和实践任务
学习后：根据平台数据自动诊断薄弱点，生成反馈报告和补弱路线
管理端：对生成资源进行审核，保证资源质量和安全性
```

相比最初版本，本次改动重点补齐了：

- 多智能体生成链路
- 个性化资源生成
- 资源审核闭环
- 学习路径持久化
- 自动学习评价
- 跨学科实践任务适配
- 大模型接口预留
- 课程知识库证据链
- 工程结构清理
