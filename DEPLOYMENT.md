# 部署指南 - 光伏关断器检测数据管理系统

## 前置要求

1. Node.js >= 16.x
2. pnpm (推荐) 或 npm
3. Netlify CLI
4. Supabase 账号和项目

## 部署步骤

### 1. 配置 Supabase

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目或使用现有项目
3. 执行数据库迁移：
   - 打开 SQL Editor
   - 执行 `supabase/schema.sql` 中的所有 SQL
   - 执行 `supabase/functions.sql` 中的所有 SQL
4. 配置存储桶：
   - 创建 `reports`、`imports`、`avatars` 存储桶
   - 设置适当的访问策略
5. 启用实时订阅：
   - 在 Database > Replication 中启用必要的表

### 2. 配置环境变量

1. 复制 `.env.example` 到 `.env.local`
2. 填入 Supabase 凭据：
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=你的_supabase_service_role_key
   ```

### 3. 本地构建测试

```bash
# 安装依赖
pnpm install

# 运行类型检查
pnpm type-check

# 运行 linter
pnpm lint

# 运行测试
pnpm test:ci

# 构建项目
pnpm build

# 本地预览
pnpm start
```

### 4. 部署到 Netlify

#### 方法一：通过 Netlify CLI（推荐）

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录 Netlify
netlify login

# 初始化项目
netlify init

# 部署
pnpm run deploy
```

#### 方法二：通过 Netlify Dashboard

1. 登录 [Netlify](https://app.netlify.com)
2. 点击 "New site from Git"
3. 连接 GitHub/GitLab/Bitbucket 仓库
4. 配置构建设置：
   - Build command: `pnpm build` 或 `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions`
5. 添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 5. 配置域名（可选）

1. 在 Netlify Dashboard 中进入站点设置
2. Domain Management > Add custom domain
3. 按照指引配置 DNS

### 6. 启用 HTTPS

Netlify 默认提供免费的 Let's Encrypt SSL 证书，会自动启用。

## 生产环境优化

### 性能优化

1. **图片优化**
   - 使用 Next.js Image 组件
   - 配置适当的图片域名白名单

2. **代码分割**
   - 使用动态导入 `dynamic(() => import())`
   - 懒加载大型组件

3. **缓存策略**
   - 配置适当的 HTTP 缓存头
   - 使用 Netlify 的边缘缓存

### 安全建议

1. **环境变量**
   - 确保敏感信息只存在服务器端
   - 使用 `NEXT_PUBLIC_` 前缀谨慎

2. **CSP 头**
   - 在 `netlify.toml` 中配置 Content Security Policy

3. **API 限流**
   - 在 Supabase 中配置 API 速率限制

## 监控和维护

### 监控设置

1. **Netlify Analytics**
   - 在 Netlify Dashboard 中启用 Analytics

2. **错误追踪**
   - 集成 Sentry 或类似服务
   - 配置错误报告

3. **性能监控**
   - 使用 Lighthouse CI
   - 设置性能预算

### 备份策略

1. **数据库备份**
   - Supabase 自动每日备份
   - 定期导出重要数据

2. **代码备份**
   - 使用 Git 版本控制
   - 定期创建发布标签

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本
   - 清除缓存重新构建
   - 查看构建日志

2. **环境变量未生效**
   - 确保在 Netlify 中正确设置
   - 重新部署

3. **Supabase 连接失败**
   - 检查网络白名单
   - 验证 API 密钥

### 回滚方案

1. 在 Netlify Dashboard 中找到 Deploys
2. 选择之前的成功部署
3. 点击 "Publish deploy"

## 更新流程

1. 在本地开发分支进行更改
2. 运行测试确保无误
3. 合并到主分支
4. Netlify 自动触发部署

## 联系支持

- Netlify 支持：https://www.netlify.com/support/
- Supabase 支持：https://supabase.com/support
- 项目维护者：[您的联系方式]

---

最后更新：2025-09-13