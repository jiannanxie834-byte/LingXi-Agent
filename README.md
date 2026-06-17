# LingXi-Agent 前端

灵析学伴学生端与管理员端前端项目，基于 Vue 3、Vite、Pinia、Element Plus 构建。

## 主要目录

```text
src/
  api/                 后端接口封装
  components/          复用组件，目前包含聊天消息和 Markdown 渲染
  layouts/             学生端、管理员端布局
  router/              路由定义
  stores/              用户登录态和学习画像状态
  utils/               Axios 请求实例
  views/               业务页面
```

## 页面结构

```text
/login                 登录/注册
/                      学生端 AI 对话
/resource              学生资源库
/plan                  个性化学习规划
/evaluation            学习评价与错题诊断
/profile               个人资料与学习画像
/admin/dashboard       管理员控制台
/admin/resource        资源审核与分类审核
/admin/user            学生用户管理
/admin/feedback        问题反馈中心
```

## 运行

```bash
npm install
npm run dev
```

默认后端地址在 `src/utils/request.js` 中配置为：

```text
http://127.0.0.1:8000/api
```

## 构建检查

```bash
npm run build
```

构建中的大包提醒主要来自 Mermaid、ECharts、KaTeX 等可视化依赖，不代表功能失败。
