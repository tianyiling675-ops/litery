# AI智能算法平台

一个基于SaaS的智能算法开发和交易平台，提供算法市场、在线开发环境、任务调度和结果可视化等完整功能。

## 🎯 项目概述

这是一个企业级的AI算法平台，支持多租户架构，为算法开发者和企业用户提供算法开发、测试、部署和交易的全生命周期管理。

## ✨ 核心功能

### 1. 算法市场
- 🔍 算法浏览和搜索
- 📊 分类和标签系统
- ⭐ 算法评分和评论
- 🛒 算法订阅和购买
- 🎯 精选算法推荐

### 2. 开发环境
- 💻 在线代码编辑器
- 🐛 实时调试功能
- 📚 算法文档管理
- 🔧 多语言支持（Python、JavaScript、Java等）

### 3. 任务调度
- ⚡ 分布式任务执行
- 📈 弹性资源管理
- 📊 实时监控和日志
- 🔄 任务队列管理

### 4. 结果可视化
- 📊 数据图表展示
- 📈 性能分析工具
- 🎨 交互式可视化
- 📋 报告生成

## 🛠 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **UI框架**: Tailwind CSS
- **路由**: React Router
- **图标**: Lucide React
- **构建工具**: Vite

### 后端技术栈
- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT + OAuth2.0
- **文件存储**: 本地文件系统
- **容器化**: Docker

### 系统架构
- **架构模式**: 微服务架构
- **多租户**: 数据库级别隔离
- **扩展性**: 水平扩展支持
- **安全性**: 多层安全防护

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 pnpm
- PostgreSQL 12+

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
# 启动开发服务器（前后端同时）
npm run dev

# 仅启动前端
npm run client:dev

# 仅启动后端
npm run server:dev
```

### 生产环境
```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 📁 项目结构

```
AI智能体网站/
├── src/                    # 前端源代码
│   ├── components/         # React组件
│   │   ├── AlgorithmCard.tsx           # 算法卡片组件
│   │   ├── AlgorithmCategories.tsx     # 算法分类组件
│   │   ├── AlgorithmFilterPanel.tsx  # 算法筛选面板
│   │   └── ...
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx                    # 首页
│   │   ├── AlgorithmMarketplace.tsx    # 算法市场
│   │   └── ...
│   ├── stores/             # 状态管理
│   │   └── algorithmStore.ts            # 算法状态管理
│   ├── types/              # TypeScript类型
│   │   └── algorithm.ts                 # 算法相关类型
│   └── ...
├── api/                    # 后端API
│   ├── routes/             # API路由
│   ├── middleware/         # 中间件
│   ├── utils/              # 工具函数
│   └── app.ts              # Express应用主文件
├── prisma/                 # 数据库架构
│   └── schema.prisma       # Prisma数据模型
├── .trae/documents/        # 项目文档
│   ├── saas_algorithm_platform_prd.md              # 产品需求文档
│   └── saas_algorithm_platform_technical_architecture.md  # 技术架构文档
└── ...
```

## 🔧 核心模块

### 算法市场模块
- ✅ 算法展示和搜索
- ✅ 分类和筛选功能
- ✅ 评分和评论系统
- ✅ 订阅和购买流程

### 用户认证模块
- ✅ JWT令牌认证
- ✅ OAuth2.0集成
- ✅ 多因素认证
- ✅ 角色权限管理

### 任务调度模块
- ✅ 分布式任务执行
- ✅ Docker容器化
- ✅ 实时任务监控
- ✅ 资源使用追踪

### 文件管理模块
- ✅ 文件上传下载
- ✅ 文件分享功能
- ✅ 安全验证
- ✅ 批量操作

## 🎯 开发计划

### 第一阶段（已完成）
- [x] 项目架构设计
- [x] 数据库设计
- [x] 基础API开发
- [x] 算法市场前端
- [x] 用户认证系统

### 第二阶段（进行中）
- [ ] 算法详情页面
- [ ] 算法运行界面
- [ ] 订阅管理
- [ ] 支付集成

### 第三阶段（计划中）
- [ ] 在线代码编辑器
- [ ] 实时调试功能
- [ ] 结果可视化
- [ ] 性能监控

## 📋 环境配置

### 环境变量
创建 `.env` 文件：
```env
# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/ai_algorithm_platform"

# JWT配置
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# OAuth2.0配置
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# 文件存储
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="100MB"

# Docker配置
DOCKER_REGISTRY="your-docker-registry"
```

## 🔒 安全特性

- **数据加密**: 敏感数据加密存储
- **访问控制**: 基于角色的权限管理
- **API安全**: 速率限制和输入验证
- **文件安全**: 文件类型检查和病毒扫描
- **容器安全**: 隔离的执行环境

## 📊 性能优化

- **数据库优化**: 索引优化和查询优化
- **缓存策略**: Redis缓存支持
- **CDN集成**: 静态资源加速
- **负载均衡**: 多实例部署支持

## 🧪 测试

```bash
# 运行单元测试
npm test

# 运行集成测试
npm run test:integration

# 运行端到端测试
npm run test:e2e
```

## 📚 文档

- [产品需求文档](.trae/documents/saas_algorithm_platform_prd.md)
- [技术架构文档](.trae/documents/saas_algorithm_platform_technical_architecture.md)
- [API文档](http://localhost:3000/api-docs)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- **项目维护者**: AI算法平台开发团队
- **创建时间**: 2025年1月16日
- **最后更新**: 2025年1月16日

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！
