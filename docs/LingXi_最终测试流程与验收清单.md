# LingXi 灵析学伴最终测试流程与验收清单

> 版本：2026-06-17  
> 测试目标：确认系统可完整运行、可完成赛题核心链路、可支撑 7 分钟演示、可提交初赛材料。  
> 测试范围：前端、后端、数据库、大模型、课程知识库、多智能体链路、学生端、管理员端、文档和提交材料。

## 1. 测试前准备

### 1.1 启动 MySQL

确认 MySQL 正常运行，且存在数据库：

```sql
CREATE DATABASE IF NOT EXISTS lingxi DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1.2 检查后端 `.env`

必须有：

```env
DATABASE_URL=mysql+pymysql://root@127.0.0.1:3306/lingxi?charset=utf8mb4
LINGXI_LLM_PROVIDER=deepseek
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
DEEPSEEK_MODEL=deepseek-v4-pro
DEEPSEEK_API_KEY=你的Key
LLM_TIMEOUT_SECONDS=60
```

或星火配置：

```env
LINGXI_LLM_PROVIDER=spark
SPARK_API_URL=https://spark-api-open.xf-yun.com/v1/chat/completions
SPARK_MODEL=lite
SPARK_API_PASSWORD=APIKey:APISecret
LLM_TIMEOUT_SECONDS=60
```

### 1.3 恢复演示数据

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Backend
source .venv/bin/activate
python scripts/seed_demo_data.py
```

预期：

- 用户、资源、反馈、评价、聊天历史恢复。
- 初始课程知识库同步。
- 管理员控制台演示就绪检查为通过。

## 2. 启动测试

### 2.1 后端启动

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Backend
source .venv/bin/activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

预期终端：

```text
Uvicorn running on http://127.0.0.1:8000
```

浏览器访问：

```text
http://127.0.0.1:8000
```

预期：

```json
{"message": "LingXi Backend Running"}
```

### 2.2 前端启动

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Agent
npm run dev
```

预期：

```text
Local: http://127.0.0.1:5173/
```

## 3. 构建与静态检查

### 3.1 后端编译

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Backend
source .venv/bin/activate
python -m compileall app scripts
```

通过标准：

- 无语法错误。
- 无 import 错误。

### 3.2 前端构建

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Agent
npm run build
```

通过标准：

- 输出 `✓ built`。
- 大包提醒可以接受，因为 Mermaid、ECharts、KaTeX 依赖体积较大。

### 3.3 结构清理检查

检查点：

- 不存在旧空页面 `src/views/Chat`。
- 不存在旧空组件 `InputBox`、`Sidebar`、`ResourceCard`。
- 前端没有浏览器默认 `prompt/confirm`。
- 首页没有调试 `console.log`。
- 后端默认不打印完整 LLM prompt。
- `__pycache__`、`.DS_Store` 不进入提交。

## 4. 后端接口测试

### 4.1 登录接口

学生：

```bash
curl -X POST http://127.0.0.1:8000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"123456"}'
```

预期：

- `code = 200`
- `role = student`

管理员：

```bash
curl -X POST http://127.0.0.1:8000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'
```

预期：

- `code = 200`
- `role = admin`

技术点：

- `auth_service.check_user_login`
- 用户角色路由分流
- sessionStorage 登录态

### 4.2 管理员统计接口

```bash
curl http://127.0.0.1:8000/api/admin/dashboard/stats
```

预期字段：

- `total_users`
- `total_resources`
- `pending_resources`
- `pending_types`
- `pending_feedback`
- `todo_count`

通过标准：

- 待办数 = 待审核资源 + 待审核分类 + 待处理反馈。

### 4.3 演示就绪检查接口

```bash
curl http://127.0.0.1:8000/api/admin/readiness
```

预期：

- `ready = true`
- `course_knowledge` 通过。
- `resource_types` 通过。
- `passed_resources` 通过。
- `review_queue` 通过。
- `evaluation` 通过。
- `chat_history` 通过。
- `llm` 通过。

技术点：

- 数据聚合。
- 赛前验收面板。
- 不暴露真实 Key，只返回配置状态。

### 4.4 资源接口

已通过资源：

```bash
curl http://127.0.0.1:8000/api/resource/list/passed
```

资源类型：

```bash
curl http://127.0.0.1:8000/api/resource/types/passed
```

通过标准：

- 已通过资源不少于 10 份。
- 资源类型不少于 7 类。
- 不出现旧的“视频/动画”作为正式类型。

### 4.5 知识库证据检索接口

```bash
curl "http://127.0.0.1:8000/api/resource/evidence/search?query=监督学习%20混淆矩阵%20模型评估"
```

预期：

- 返回至少 1 条依据。
- 前几条应包含“监督学习与模型评估”或“混淆矩阵”相关资源。

技术点：

- `course_knowledge` 检索。
- 已审核 `resources` 检索。
- 防幻觉依据链。

### 4.6 聊天接口

```bash
curl -X POST http://127.0.0.1:8000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"username":"student","session_id":"","message":"请根据课程知识库解释监督学习和混淆矩阵的关系。"}'
```

预期：

- `code = 200`
- `data.reply` 有内容。
- `data.pipeline_steps` 包含 `intent`、`evidence`、`profile`、`answer`。
- `data.evidence` 至少 1 条。
- `data.session_id` 存在。

技术点：

- 意图识别 Agent。
- 知识检索 Agent。
- 画像建模 Agent。
- LLM provider。
- 聊天历史持久化。

### 4.7 聊天历史接口

```bash
curl "http://127.0.0.1:8000/api/chat/sessions?username=student"
```

选择一个 `session_id`：

```bash
curl "http://127.0.0.1:8000/api/chat/sessions/{session_id}/messages?username=student"
```

预期：

- 消息顺序正确。
- AI 消息包含 `pipeline_steps`。
- AI 消息包含 `evidence`。
- AI 消息包含 `safety_summary` 字段。

技术点：

- `chat_sessions`
- `chat_messages`
- `metadata_json`

### 4.8 学习规划接口

读取：

```bash
curl "http://127.0.0.1:8000/api/plan/list?username=student"
```

保存：

```bash
curl -X POST http://127.0.0.1:8000/api/plan/save \
  -H "Content-Type: application/json" \
  -d '{"username":"student","plans":[]}'
```

技术点：

- `learning_plans`
- MySQL 持久化。
- 无运行期内存缓存。

### 4.9 待办接口

读取：

```bash
curl "http://127.0.0.1:8000/api/todo/list?username=student"
```

保存：

```bash
curl -X POST http://127.0.0.1:8000/api/todo/save \
  -H "Content-Type: application/json" \
  -d '{"username":"student","todos":[{"id":1,"content":"测试待办","done":false}]}'
```

技术点：

- `todo_lists`
- 规划执行数据进入画像计算。

### 4.10 学习评价接口

自动诊断：

```bash
curl -X POST http://127.0.0.1:8000/api/evaluation/auto \
  -H "Content-Type: application/json" \
  -d '{"username":"student"}'
```

手动提交：

```bash
curl -X POST http://127.0.0.1:8000/api/evaluation/submit \
  -H "Content-Type: application/json" \
  -d '{"username":"student","topic":"监督学习与模型评估","wrong_notes":"混淆矩阵中精确率和召回率容易混淆","answer_summary":"能说出概念但不会结合场景解释","confidence":55}'
```

历史：

```bash
curl "http://127.0.0.1:8000/api/evaluation/history?username=student"
```

预期：

- 自动诊断有报告。
- 手动提交有记录。
- 历史列表可查看。
- 诊断结果可反向更新画像。

### 4.11 PPT 导出接口

先从资源列表取一个资源 ID，然后访问：

```text
http://127.0.0.1:8000/api/resource/export/pptx/{res_id}
```

预期：

- 下载 `.pptx` 文件。
- 文件可打开。
- 内容来自资源标题、摘要和正文。

## 5. 学生端页面测试

### 5.1 登录页

操作：

1. 打开前端。
2. 未登录时应进入 `/login`。
3. 输入 `student / 123456`。

预期：

- 登录成功。
- 跳转学生首页。
- 不直接展示学生首页给未登录用户。

### 5.2 首页对话

操作：

1. 输入：`请根据课程知识库解释监督学习和混淆矩阵的关系。`
2. 等待回复。

预期：

- 有 AI 回复。
- 有多智能体处理链路。
- 有知识库依据。
- 没有后端异常提示。
- Markdown 渲染正常。

### 5.3 聊天刷新持久化

操作：

1. 发送一条消息。
2. 刷新页面。
3. 点击左侧历史会话。

预期：

- 用户消息和 AI 消息仍在。
- 处理链路仍在。
- 知识库依据仍在。

### 5.4 资源库

操作：

1. 进入资源页。
2. 搜索 `神经网络`。
3. 打开资源详情。
4. 点击导出 PPT。

预期：

- 资源卡片正常展示。
- 筛选统计显示 `已筛选 X / Y 份`。
- 详情弹窗有摘要、来源、正文。
- Markdown 和 Mermaid 正常渲染。
- PPT 可下载。

### 5.5 规划页

操作：

1. 查看已有路线。
2. 新增独立规划路线。
3. 插入任务。
4. 修改任务状态。
5. 添加待办。
6. 删除任务或路线。

预期：

- 弹窗风格统一为 Element Plus。
- 保存后刷新不丢。
- 总体进度会变化。

### 5.6 评价页

操作：

1. 点击平台自动诊断。
2. 展开手动补充错题。
3. 提交一次错题说明。

预期：

- 自动诊断能生成报告。
- 手动补充能生成诊断。
- 评价历史更新。
- 画像数据更新。

### 5.7 个人中心

操作：

1. 修改昵称。
2. 修改头像。
3. 修改简介。
4. 提交反馈。

预期：

- 修改后不强制退出。
- 头像显示正常。
- 反馈进入管理员端。
- 动态画像更新时间格式正确。

## 6. 管理员端页面测试

### 6.1 管理员登录

操作：

1. 退出学生账号。
2. 输入 `admin / 123456`。

预期：

- 跳转 `/admin/dashboard`。
- 管理员不能进入学生页面。
- 学生不能进入管理员页面。

### 6.2 控制台概览

检查：

- 5 个统计卡片一行展示。
- 待办数计算正确。
- 演示就绪检查显示通过。
- 页面无横向滚动条。

### 6.3 资源审核与管理

操作：

1. 进入 `/admin/resource`。
2. 查看待审核资源。
3. 打开详情。
4. 查看安全自检。
5. 点击通过。

预期：

- 资源状态文字和颜色同步更新。
- 通过后学生端可见。
- 表格无不必要横向滚动条。

### 6.4 分类审核

操作：

1. 学生端申请新资源分类。
2. 管理员端审核通过。

预期：

- 分类进入审核列表。
- 通过后学生资源页出现该分类。

### 6.5 反馈中心

操作：

1. 学生提交反馈。
2. 管理员查看反馈。
3. 标记处理。
4. 删除反馈。

预期：

- 状态更新即时。
- 删除弹窗标题为“提示”。
- 弹窗文案无无关学科词。

### 6.6 学生用户管理

检查：

- 展示登录账号。
- 展示昵称。
- 展示学时。
- 展示知识点概括，而不是冗余标签堆叠。

## 7. 赛题能力对应测试

| 赛题能力 | 测试入口 | 测试方法 | 通过标准 | 技术点 |
|---|---|---|---|---|
| 对话式画像构建 | 首页、个人中心 | 发送学习问题后看画像 | 画像更新、知识点概括变化 | profile_agent、profile_service |
| 6 维以上画像 | 个人中心 | 查看雷达图和维度 | 维度不少于 6 | 画像维度模型 |
| 多智能体协同 | 首页 | 查看处理链路 | 展示意图、依据、画像、回答、规划、资源、安全 | orchestrator_service |
| 5 类以上资源 | 资源库 | 查看资源分类 | 至少 7 类 | resource_service |
| 多模态资源 | 资源详情 | 打开多模态学习包 | 有文字、流程图、代码注释、题解、PPT 页纲 | Markdown、Mermaid、PPT 导出 |
| 路径规划 | 规划页 | 触发规划并查看 | 生成路线并持久化 | planner_agent、learning_plans |
| 精准推送 | 首页、资源库 | 对话生成资源后审核 | 资源进入审核，通过后可见 | resource_agent、管理员审核 |
| 智能辅导 | 首页 | 问课程问题 | 即时答疑并展示依据 | LLM provider、RAG-like 检索 |
| 学习效果评估 | 评价页 | 自动诊断/错题提交 | 生成报告和建议 | evaluation_service |
| 防幻觉 | 首页、资源审核 | 查看知识依据和安全自检 | 依据可见，自检可见 | knowledge_evidence_service、content_guard |
| 响应体验 | 首页 | 等待 AI 回复 | 有进度链路，不白屏 | 前端处理链路展示 |
| 初始知识库 | 资源库、后端 data | 查看课程文档 | 《人工智能导论》完整文档集存在 | data/knowledge_base |

## 8. 数据库验证

建议检查表：

- `users`
- `resources`
- `resource_types`
- `feedbacks`
- `learning_plans`
- `todo_lists`
- `evaluation_records`
- `course_knowledge`
- `chat_sessions`
- `chat_messages`

重点：

- 新建用户写入 `users`。
- 聊天写入 `chat_sessions`、`chat_messages`。
- AI 消息元数据写入 `chat_messages.metadata_json`。
- 资源生成写入 `resources` 且初始状态为待审核。
- 评价写入 `evaluation_records`。
- 规划写入 `learning_plans`。

## 9. 最终演示验收清单

演示前逐项确认：

- [ ] MySQL 已启动。
- [ ] 后端 `.env` 配置正确。
- [ ] 后端 8000 启动成功。
- [ ] 前端 5173 或新端口启动成功。
- [ ] `student / 123456` 可登录。
- [ ] `admin / 123456` 可登录。
- [ ] 首页聊天可回复。
- [ ] 聊天有知识库依据。
- [ ] 刷新后聊天历史不丢。
- [ ] 资源库有《人工智能导论》资源。
- [ ] 资源搜索可用。
- [ ] 资源详情可导出 PPT。
- [ ] 规划页可保存路线和任务。
- [ ] 评价页可自动诊断。
- [ ] 个人中心画像可展示。
- [ ] 学生反馈可提交。
- [ ] 管理员资源审核可操作。
- [ ] 管理员反馈处理可操作。
- [ ] 演示就绪检查为通过。
- [ ] 不提交 `.env`。
- [ ] 不提交 `lingxi.db`。

## 10. 已验证的命令

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Backend
source .venv/bin/activate
python -m compileall app scripts
python scripts/seed_demo_data.py
```

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Agent
npm run build
```

构建和接口回归通过后，可以进行录屏和材料提交。

