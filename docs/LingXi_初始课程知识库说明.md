# LingXi 初始课程知识库说明

## 课程定位

当前系统围绕高校《深度学习》课程构建初始知识库，作为多智能体学习辅导、路径规划、资源 Artifact 生成、公开视频推荐和教师审核的课程依据。

## 后端数据目录

```text
LingXi-Backend/data/knowledge_base/deep_learning/
  manifest.json              课程知识库总清单
  knowledge_units.jsonl      12 个知识单元索引
  video_catalog.json         公开教学视频入口目录
  references.json            教材、公开课程、官方文档入口
  chapters/                  12 章课程讲义
  labs/                      PyTorch 实验代码
```

## 课程章节

1. 深度学习导论与能力诊断
2. 数学与机器学习前置知识
3. 神经元、感知机与多层感知机
4. 损失函数与反向传播
5. 优化算法与训练稳定性
6. 正则化、归一化与泛化
7. 卷积神经网络 CNN
8. 序列模型 RNN、LSTM 与 GRU
9. Transformer 与注意力机制
10. 生成模型导论
11. PyTorch 深度学习工程实践
12. 课程综合项目

## 资源 Artifact 口径

系统不再生成平级的总包型资源。多模态效果由同一主题下多个具体 Artifact 组合展示：

- 课程讲解文档
- 知识点思维导图
- 练习题集
- 拓展阅读包
- PyTorch 实操案例
- PPT 大纲
- 外部公开视频推荐卡
- 个性化视频观看指南
- 交互动画规格
- 动画分镜
- 课程实践项目任务书
- 诊断与补弱报告

## 同步方式

```bash
cd /Users/rinko/Documents/软件杯/LingXi-Backend
source .venv/bin/activate
python scripts/seed_deep_learning_course.py
```

启动后端时也会检查课程知识库并同步必要数据。

## 验证方式

1. 登录学生端。
2. 进入“资源工厂”。
3. 查看深度学习课程相关 Artifact。
4. 在首页发送“我要学习 CNN”或“帮我规划 Transformer 学习路线”。
5. 管理端进入资源审核，确认生成资源绑定深度学习章节和知识单元。
