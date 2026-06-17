# LingXi 灵析学伴最终使用教程

> 版本：2026-06-17  
> 适用范围：软件杯初赛演示、源码提交、本地验收、答辩前排练  
> 项目类型：Web 应用，前后端分离  
> 前端仓库：`LingXi-Agent`  
> 后端仓库：`LingXi-Backend`

## 1. 系统简介

LingXi 灵析学伴是面向高等教育个性化学习场景的多智能体学习资源生成系统。

系统围绕《人工智能导论》课程构建完整初始知识库，支持学生通过自然语言对话形成动态学习画像，并由多个智能体协同完成学习辅导、知识库依据检索、个性化路径规划、资源生成、内容安全自检、管理员审核和学习效果评价。

核心演示闭环如下：

```text
学生登录
-> 自然语言提问
-> 意图识别 Agent 判断学习需求
-> 知识检索 Agent 命中课程知识库依据
-> 画像建模 Agent 更新动态学生画像
-> 学习辅导 Agent 生成个性化回答
-> 路径规划 Agent 生成学习路线
-> 资源设计 Agent 生成配套资源
-> 内容安全 Agent 完成防幻觉与安全自检
-> 管理员审核资源和反馈
-> 学生在资源库、规划页、评价页继续学习
```

## 2. 项目结构

本地根目录：

```bash
/Users/rinko/Documents/软件杯
```

前端：

```text
LingXi-Agent/
  src/api/                  后端接口封装
  src/components/           聊天消息、Markdown 渲染等复用组件
  src/layouts/              学生端和管理员端布局
  src/router/               路由配置
  src/stores/               Pinia 用户状态与画像状态
  src/views/                学生端与管理员端页面
```

后端：

```text
LingXi-Backend/
  app/agents/               意图识别、画像、规划、资源生成等 Agent
  app/routers/              FastAPI 接口
  app/models/               SQLAlchemy 数据模型
  app/services/             业务服务、大模型调用、多智能体编排
  data/knowledge_base/      《人工智能导论》初始课程知识库
  scripts/seed_demo_data.py 演示基准数据恢复脚本
```

## 3. 技术栈

前端：

- Vue 3
- Vite
- Pinia
- Element Plus
- Axios
- Markdown-it
- Mermaid
- ECharts

后端：

- Python
- FastAPI
- SQLAlchemy
- MySQL
- Uvicorn
- python-pptx
- DeepSeek / 讯飞星火大模型接口
- 本地规则兜底与课程知识库检索

## 4. 环境准备

### 4.1 后端环境

进入后端目录：

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Backend
```

创建或激活虚拟环境：

```bash
python -m venv .venv
source .venv/bin/activate
```

安装依赖：

```bash
pip install -r requirements.txt
```

### 4.2 MySQL 数据库

当前正式演示使用 MySQL，不使用旧 SQLite 文件。

推荐本地数据库：

```text
host: 127.0.0.1
port: 3306
database: lingxi
user: root
password: 本机配置
charset: utf8mb4
```

如数据库不存在，先创建：

```sql
CREATE DATABASE lingxi DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

后端 `.env` 中配置：

```env
DATABASE_URL=mysql+pymysql://root@127.0.0.1:3306/lingxi?charset=utf8mb4
```

如果本机 root 有密码，应改成：

```env
DATABASE_URL=mysql+pymysql://root:你的密码@127.0.0.1:3306/lingxi?charset=utf8mb4
```

注意：`LingXi-Backend/lingxi.db` 是早期 SQLite 测试文件，当前不作为正式演示数据源，不建议提交。

### 4.3 大模型配置

后端 `.env` 支持 DeepSeek 和讯飞星火两种方式。

DeepSeek：

```env
LINGXI_LLM_PROVIDER=deepseek
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions
DEEPSEEK_MODEL=deepseek-v4-pro
DEEPSEEK_API_KEY=你的DeepSeekKey
LLM_TIMEOUT_SECONDS=60
```

讯飞星火：

```env
LINGXI_LLM_PROVIDER=spark
SPARK_API_URL=https://spark-api-open.xf-yun.com/v1/chat/completions
SPARK_MODEL=lite
SPARK_API_PASSWORD=APIKey:APISecret
LLM_TIMEOUT_SECONDS=60
```

说明：

- 讯飞星火这里不填 APPID。
- `SPARK_API_PASSWORD` 填 `APIKey:APISecret`。
- 切换模型后必须重启后端。
- 不要提交真实 `.env`。
- 如需查看模型调用摘要日志，可加 `LINGXI_DEBUG_LLM=1`。

## 5. 初始化演示数据

进入后端并激活虚拟环境：

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Backend
source .venv/bin/activate
```

恢复演示基准数据：

```bash
python scripts/seed_demo_data.py
```

该脚本会准备：

- 学生账号
- 管理员账号
- 已审核资源
- 待审核资源
- 待审核资源分类
- 待处理反馈
- 学习评价记录
- 聊天历史
- 《人工智能导论》课程知识点和资源库

## 6. 启动系统

### 6.1 启动后端

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Backend
source .venv/bin/activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

或：

```bash
python run.py
```

后端地址：

```text
http://127.0.0.1:8000
```

接口前缀：

```text
http://127.0.0.1:8000/api
```

### 6.2 启动前端

新开终端：

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Agent
npm install
npm run dev
```

前端地址通常为：

```text
http://127.0.0.1:5173/
```

如果提示 `Port 5173 is in use, trying another one...`，则使用终端显示的新地址，例如：

```text
http://127.0.0.1:5174/
```

## 7. 默认账号

| 角色 | 登录账号 | 密码 | 用途 |
|---|---|---|---|
| 学生 | `student` | `123456` | 学生端完整流程演示 |
| 管理员 | `admin` | `123456` | 管理员端审核和治理 |

Google 或浏览器提示 `admin / student` 密码泄露，是因为演示账号密码过于简单，属于浏览器通用弱密码提醒。比赛演示可以继续使用；正式部署应改为强密码和加密存储。

## 8. 学生端使用流程

### 8.1 登录

打开前端地址，进入登录页。

输入：

```text
账号：student
密码：123456
```

登录后进入学生首页。

### 8.2 AI 对话与知识库依据

首页是多智能体学习助手。

建议输入：

```text
请根据课程知识库解释监督学习和混淆矩阵的关系。
```

预期表现：

- 出现“多智能体处理链路”。
- 链路包含“检索课程知识库依据”。
- AI 回复下方展示“知识库依据”。
- 回答内容基于《人工智能导论》课程知识库。
- 刷新页面后历史会话仍然保留。

### 8.3 触发学习路线和资源生成

建议输入：

```text
我想系统学习人工智能导论中的监督学习，请帮我规划路线并生成配套资源。
```

预期表现：

- 生成学习路线。
- 生成配套资源。
- 资源先进入管理员审核队列。
- 内容安全 Agent 给出自检摘要。
- 学生画像同步更新。

### 8.4 资源库

进入底部导航“资源”。

可演示：

- 查看《人工智能导论》初始课程资源。
- 搜索 `监督学习`、`神经网络`、`安全伦理` 等关键词。
- 打开资源详情。
- 查看 Markdown 正文。
- 查看资源来源。
- 点击“导出PPT”下载真实 `.pptx` 文件。

当前资源类型：

1. 专业课程讲解文档
2. 知识点思维导图
3. 不同类型练习题目
4. 拓展阅读材料
5. 多模态学习包
6. 错题诊断与学习反馈报告
7. 学科实践应用任务

### 8.5 学习规划

进入“规划”页面。

可演示：

- 查看 AI 生成路线。
- 修改任务状态：待开始、进行中、已学完。
- 新增独立规划路线。
- 插入自定义任务。
- 添加独立待办。
- 删除路线或任务。

所有操作会保存到 MySQL。

### 8.6 学习评价

进入“评价”页面。

可演示：

- 平台自动诊断。
- 手动补充线下错题或特殊卡点。
- 生成诊断报告。
- 低分或薄弱项会形成补弱建议和路线。
- 评价记录进入历史。

### 8.7 个人中心

进入“我的”或“个人中心”。

可演示：

- 修改昵称、简介、头像。
- 查看动态学习画像。
- 查看知识点概括。
- 查看画像更新时间。
- 提交问题反馈。

头像支持更符合用户操作习惯的方式，不再只要求粘贴头像链接。

## 9. 管理员端使用流程

### 9.1 登录管理员

退出学生账号后登录：

```text
账号：admin
密码：123456
```

管理员登录后进入：

```text
/admin/dashboard
```

### 9.2 控制台概览

可查看：

- 全站注册总数。
- 知识库资源总数。
- 待审核资源。
- 待审核资源分类。
- 待处理问题反馈。
- 演示就绪检查。

“演示就绪检查”用于赛前确认：

- 初始课程知识库是否存在。
- 资源类型是否达标。
- 已开放资源是否足够。
- 审核队列是否可演示。
- 学习评价记录是否存在。
- 聊天历史是否存在。
- 大模型配置是否可用。

### 9.3 资源审核与分类审核

进入“资源库审核”。

可演示：

- 查看待审核资源。
- 查看资源摘要、正文、来源。
- 查看内容安全 Agent 自检结果。
- 通过资源。
- 驳回资源。
- 审核学生申请的新资源分类。

审核通过后，学生端资源库可见。

### 9.4 学生用户管理

进入“学生用户管理”。

可查看：

- 学生账号。
- 展示昵称。
- 学习时长。
- 知识点概括。
- 角色。

当前设计采用“登录账号唯一、展示昵称可重复”的方式，符合常见系统逻辑。

### 9.5 问题反馈中心

进入“问题反馈中心”。

可演示：

- 查看学生提交的问题反馈。
- 标记处理。
- 删除反馈。

删除反馈弹窗使用统一风格，并使用“提示”而不是“警告”。

## 10. 推荐 7 分钟演示路线

```text
00:00-00:30 介绍系统定位和赛题痛点
00:30-01:10 学生登录，展示对话式学习入口
01:10-02:00 提问“监督学习和混淆矩阵”，展示知识库依据链
02:00-02:50 要求规划路线和生成资源，展示多智能体链路
02:50-03:40 进入资源库，查看多模态学习包和导出 PPT
03:40-04:30 进入规划页，展示路线、任务状态和待办
04:30-05:10 进入评价页，展示自动诊断和错题补弱
05:10-06:20 管理员登录，审核资源、分类和反馈
06:20-07:00 回到价值总结：个性化、知识库、审核治理、防幻觉、多模态
```

## 11. 常见问题

### 11.1 `uvicorn: command not found`

不要直接运行 `uvicorn`，改用：

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

或先激活虚拟环境：

```bash
source .venv/bin/activate
```

### 11.2 `address already in use`

说明 8000 端口已有后端在运行。

查看：

```bash
lsof -nP -iTCP:8000 -sTCP:LISTEN
```

如需停止：

```bash
kill 进程号
```

### 11.3 前端端口不是 5173

Vite 会自动换端口。看终端输出的 `Local:` 地址即可。

### 11.4 聊天提示后端异常

检查：

1. 后端是否启动。
2. 前端 `src/utils/request.js` 的 baseURL 是否为 `http://127.0.0.1:8000/api`。
3. `.env` 中大模型 Key 是否正确。
4. MySQL 是否启动。

### 11.5 大模型不可用怎么办

系统有本地课程知识库兜底，基础演示仍可运行；但为了体现前沿 AI 融合，正式演示建议配置真实 DeepSeek 或讯飞星火 Key。

## 12. 提交注意事项

应提交：

- `LingXi-Agent` 前端源码。
- `LingXi-Backend` 后端源码。
- `LingXi-Backend/data/knowledge_base/artificial_intelligence_intro/` 初始课程知识库。
- `.env.example`。
- 说明文档、测试文档、PPT、演示视频。

不应提交：

- `LingXi-Backend/.env`
- 真实模型 Key。
- `LingXi-Backend/lingxi.db`
- `.venv`
- `node_modules`
- `dist`
- `__pycache__`
- `.DS_Store`

