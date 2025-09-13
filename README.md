# 光伏关断器检测数据管理系统 (Solar Test Data Management System)

[![Netlify Status](https://api.netlify.com/api/v1/badges/46648482-644c-4c80-bafb-872057e51b6b/deploy-status)](https://app.netlify.com/sites/next-dev-starter/deploys)

## 项目概述

这是一个基于 Next.js 15 开发的工业级光伏关断器检测数据管理系统，采用现代化的技术栈，提供数据采集、分析、可视化和管理功能。系统设计遵循工业美学，具有专业的数据大屏展示功能。

### 技术栈
- **前端框架**: Next.js 15 + React 18
- **UI设计**: 工业风格、响应式设计
- **数据库**: Supabase (PostgreSQL)
- **部署**: Netlify
- **数据可视化**: Recharts, D3.js
- **样式**: CSS Modules + Tailwind CSS

### 核心功能
- Excel数据批量导入/导出
- 实时数据监控大屏
- 多维度数据分析
- 自动报告生成
- 用户权限管理
- 移动端适配

## 环境配置

### Supabase配置
在项目根目录创建 `.env.local` 文件，添加以下配置：
```
NEXT_PUBLIC_SUPABASE_URL=https://zzyueuweeoakopuuwfau.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDM4MTMwMSwiZXhwIjoyMDU5OTU3MzAxfQ.CTLF9Ahmxt7alyiv-sf_Gl3U6SNIWZ01PapTI92Hg0g
```

## TASK 任务追踪

### 待完成任务
- [ ] 创建项目目录结构和配置文件 - 2025-09-13
- [ ] 设计数据库表结构
- [ ] 开发前端页面组件
- [ ] 实现数据管理功能
- [ ] 创建数据大屏展示
- [ ] 集成Supabase后端
- [ ] 优化UI/UX设计
- [ ] 编写测试用例
- [ ] 部署到Netlify

### 已完成任务
- [x] 编制光伏关断器检测数据管理系统PRD文档 - 2025-09-13

### 发现的新任务
- [ ] 创建示例数据文件
- [ ] 配置ESLint和Prettier
- [ ] 添加国际化支持

## Table of Contents:

- [Getting Started](#getting-started)
- [Installation options](#installation-options)
- [Testing](#testing)
  - [Included Default Testing](#included-default-testing)
  - [Removing Renovate](#removing-renovate)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

### Installation options

**Option one:** One-click deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/netlify-templates/next-netlify-starter&utm_source=github&utm_medium=nextstarter-cs&utm_campaign=devex-cs)

**Option two:** Manual clone

1. Clone this repo: `git clone https://github.com/netlify-templates/next-netlify-starter.git`
2. Navigate to the directory and run `npm install`
3. Run `npm run dev`
4. Make your changes
5. Connect to [Netlify](https://url.netlify.com/Bk4UicocL) manually (the `netlify.toml` file is the one you'll need to make sure stays intact to make sure the export is done and pointed to the right stuff)

## Testing

### Included Default Testing

We’ve included some tooling that helps us maintain these templates. This template currently uses:

- [Renovate](https://www.mend.io/free-developer-tools/renovate/) - to regularly update our dependencies
- [Cypress](https://www.cypress.io/) - to run tests against how the template runs in the browser
- [Cypress Netlify Build Plugin](https://github.com/cypress-io/netlify-plugin-cypress) - to run our tests during our build process

If your team is not interested in this tooling, you can remove them with ease!

### Removing Renovate

In order to keep our project up-to-date with dependencies we use a tool called [Renovate](https://github.com/marketplace/renovate). If you’re not interested in this tooling, delete the `renovate.json` file and commit that onto your main branch.
