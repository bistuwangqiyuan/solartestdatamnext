# Supabase 数据库迁移指南

## 步骤 1: 登录 Supabase Dashboard

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 使用您的账户登录
3. 选择项目 (如果没有项目，需要先创建)

## 步骤 2: 执行数据库迁移

1. 在左侧菜单中点击 "SQL Editor"
2. 点击 "New query"
3. 复制 `schema.sql` 文件的全部内容
4. 粘贴到 SQL 编辑器中
5. 点击 "Run" 执行 SQL

## 步骤 3: 验证表结构

执行以下查询验证表是否创建成功：

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 查看表结构
\d profiles
\d devices
\d test_batches
\d test_data
\d reports
\d alerts
```

## 步骤 4: 配置存储桶（用于文件上传）

1. 在左侧菜单中点击 "Storage"
2. 点击 "New bucket"
3. 创建以下存储桶：
   - `reports` - 用于存储生成的报告文件
   - `imports` - 用于存储导入的 Excel 文件
   - `avatars` - 用于存储用户头像

4. 设置存储桶权限：
   - 点击存储桶名称
   - 点击 "Policies"
   - 添加适当的访问策略

## 步骤 5: 启用实时订阅

1. 在左侧菜单中点击 "Database"
2. 点击 "Replication"
3. 启用以下表的实时订阅：
   - `test_batches`
   - `test_data`
   - `alerts`

## 步骤 6: 配置认证设置

1. 在左侧菜单中点击 "Authentication"
2. 点击 "Providers"
3. 启用 "Email" 认证
4. 配置以下设置：
   - 启用邮箱验证（可选）
   - 设置密码最小长度为 8
   - 配置注册后的重定向 URL

## 步骤 7: 获取连接信息

1. 在左侧菜单中点击 "Settings"
2. 点击 "API"
3. 记录以下信息：
   - Project URL
   - Anon public key
   - Service role key

## 注意事项

- 确保在生产环境中使用前充分测试
- 定期备份数据库
- 监控数据库性能和使用情况
- 根据需要调整 RLS 策略

## 故障排除

### 如果遇到权限错误：
```sql
-- 检查当前用户权限
SELECT current_user;

-- 查看 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'your_table_name';
```

### 如果表创建失败：
1. 检查是否有语法错误
2. 确保扩展已启用
3. 检查是否有命名冲突

## 回滚方案

如果需要回滚，执行以下 SQL：

```sql
-- 删除所有表和类型
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.test_data CASCADE;
DROP TABLE IF EXISTS public.test_batches CASCADE;
DROP TABLE IF EXISTS public.devices CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS report_type;
DROP TYPE IF EXISTS test_result;
DROP TYPE IF EXISTS batch_status;
DROP TYPE IF EXISTS user_role;
```