# Cloudflare 部署指南

本指南将帮助你将前端、后端和数据库完整部署到 Cloudflare 平台。

## 📋 前置要求

- Node.js 18+ 和 pnpm
- Cloudflare 账号（免费版即可）
- Git
- Wrangler CLI（Cloudflare 官方工具）

## 🚀 快速部署（推荐）

### 方式 1：一键部署脚本

```bash
# 1. 登录 Cloudflare 并初始化
./scripts/setup-cloudflare.sh

# 2. 部署到生产环境
./scripts/deploy-cloudflare.sh
```

就这么简单！脚本会自动完成所有配置和部署。

---

## 📖 手动部署（详细步骤）

如果你想了解每一步的细节，或遇到问题需要排查，请按照以下步骤操作。

### 第一步：安装和登录

#### 1.1 安装 Wrangler CLI

```bash
# 全局安装
npm install -g wrangler

# 或在项目中使用
cd backend
pnpm install
```

#### 1.2 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，完成 OAuth 授权。

#### 1.3 验证登录状态

```bash
wrangler whoami
```

---

### 第二步：部署数据库（Cloudflare D1）

#### 2.1 创建 D1 数据库

```bash
wrangler d1 create scaffold-db
```

输出示例：

```
✅ Successfully created DB 'scaffold-db'

[[d1_databases]]
binding = "DB"
database_name = "scaffold-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 复制这个 ID
```

#### 2.2 更新后端配置

编辑 `backend/wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "scaffold-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 粘贴上面的 database_id
```

#### 2.3 运行数据库迁移

```bash
cd backend

# 生产环境迁移
pnpm run db:migrate:prod
```

输出示例：

```
🌀 Executing on remote database scaffold-db:
🌀 To execute on your local development database, pass the --local flag to 'wrangler d1 execute'
✅ Executed 1 queries in 0.5s
```

#### 2.4 验证数据库（可选）

```bash
# 查询表结构
wrangler d1 execute scaffold-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

---

### 第三步：部署后端（Cloudflare Workers）

#### 3.1 配置环境变量

编辑 `backend/wrangler.toml`，更新生产环境配置：

```toml
[env.production.vars]
CORS_ORIGINS = "https://your-frontend-domain.pages.dev"  # 稍后更新
```

#### 3.2 部署 Workers

```bash
cd backend
pnpm run deploy
```

输出示例：

```
⛅️ wrangler 3.114.17
-------------------------------------------------------
Uploaded scaffold-api (3.45 sec)
Published scaffold-api (0.29 sec)
  https://scaffold-api.your-subdomain.workers.dev
```

#### 3.3 测试后端 API

```bash
# 记录你的 Worker URL
WORKER_URL="https://scaffold-api.your-subdomain.workers.dev"

# 测试健康检查
curl $WORKER_URL/health

# 预期输出
{
  "status": "healthy",
  "timestamp": "2026-01-30T08:00:00.000Z",
  "environment": "production"
}

# 测试 API
curl $WORKER_URL/api/v1/items
```

---

### 第四步：部署前端（Cloudflare Pages）

#### 4.1 配置前端环境变量

创建 `frontend/.env.production`：

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=https://scaffold-api.your-subdomain.workers.dev" > .env.production
```

#### 4.2 构建前端

```bash
pnpm run pages:build
```

这会生成 `.vercel/output/static` 目录。

#### 4.3 部署到 Cloudflare Pages

```bash
pnpm wrangler pages deploy .vercel/output/static --project-name=scaffold-frontend
```

首次部署会提示创建项目：

```
? Create a new project? (Y/n) › Y
```

输出示例：

```
✨ Compiled Worker successfully
✨ Uploading...
✨ Deployment complete! Take a peek over at https://xxxxxxxx.scaffold-frontend.pages.dev
```

#### 4.4 记录前端 URL

你的前端地址格式为：

```
https://xxxxxxxx.scaffold-frontend.pages.dev
```

---

### 第五步：更新 CORS 配置

#### 5.1 更新后端 CORS

编辑 `backend/wrangler.toml`：

```toml
[env.production.vars]
CORS_ORIGINS = "https://xxxxxxxx.scaffold-frontend.pages.dev"
```

#### 5.2 重新部署后端

```bash
cd backend
pnpm run deploy
```

---

### 第六步：配置自定义域名（可选）

#### 6.1 前端自定义域名

1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择你的域名
3. 进入 `Pages` → `scaffold-frontend`
4. 点击 `Custom domains` → `Set up a custom domain`
5. 输入域名（如 `app.yourdomain.com`）
6. Cloudflare 会自动配置 DNS

#### 6.2 后端自定义域名

1. 进入 `Workers & Pages` → `scaffold-api`
2. 点击 `Triggers` → `Custom Domains`
3. 添加自定义域名（如 `api.yourdomain.com`）

#### 6.3 更新环境变量

使用自定义域名后，更新：

**前端** (`frontend/.env.production`)：

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**后端** (`backend/wrangler.toml`)：

```toml
[env.production.vars]
CORS_ORIGINS = "https://app.yourdomain.com"
```

重新部署前端和后端。

---

## 🔧 高级配置

### 环境管理

Cloudflare 支持多环境部署：

```toml
# backend/wrangler.toml

# 开发环境
[env.development]
[env.development.vars]
CORS_ORIGINS = "http://localhost:3000"

# 测试环境
[env.staging]
name = "scaffold-api-staging"
[env.staging.vars]
CORS_ORIGINS = "https://staging.yourdomain.com"

# 生产环境
[env.production]
[env.production.vars]
CORS_ORIGINS = "https://app.yourdomain.com"
```

部署到特定环境：

```bash
# 部署到测试环境
wrangler deploy --env staging

# 部署到生产环境
wrangler deploy --env production
```

### 数据库备份

```bash
# 导出数据
wrangler d1 export scaffold-db --output=backup-$(date +%Y%m%d).sql

# 恢复数据
wrangler d1 execute scaffold-db --file=backup-20260130.sql
```

### 查看日志

```bash
# 实时查看 Worker 日志
wrangler tail scaffold-api

# 查看 Pages 部署日志
wrangler pages deployment list --project-name=scaffold-frontend
```

---

## 🐛 常见问题

### 1. 数据库迁移失败

**错误：** `Couldn't find a D1 DB with the name or binding 'scaffold-db'`

**解决：**

```bash
# 1. 检查数据库是否存在
wrangler d1 list

# 2. 确认 wrangler.toml 中的 database_id 正确
# 3. 重新创建数据库
wrangler d1 create scaffold-db
```

### 2. CORS 错误

**错误：** `Access to fetch at 'https://api.workers.dev' has been blocked by CORS policy`

**解决：**

1. 确认 `backend/wrangler.toml` 中的 `CORS_ORIGINS` 包含前端域名
2. 重新部署后端
3. 清除浏览器缓存

### 3. 前端构建失败

**错误：** `Error: NEXT_PUBLIC_API_URL is not defined`

**解决：**

```bash
# 确保 .env.production 存在
echo "NEXT_PUBLIC_API_URL=https://your-api-url.workers.dev" > frontend/.env.production

# 重新构建
pnpm run pages:build
```

### 4. Edge Runtime 配置错误

**错误：** `The following routes were not configured to run with the Edge Runtime`

**原因：** Cloudflare Pages 需要所有动态路由使用 Edge Runtime

**解决：**

在页面文件顶部添加：

```typescript
// 服务端组件
export const runtime = 'edge';

export default function Page() {
  // ...
}
```

或对于客户端组件：

```typescript
'use client';

export const runtime = 'edge';

import { useState } from 'react';
// ...
```

### 5. pnpm 锁文件过期

**错误：** `ERR_PNPM_OUTDATED_LOCKFILE`

**解决：**

```bash
cd frontend
rm pnpm-lock.yaml
pnpm install
```

### 6. Worker 部署超时

**解决：**

```bash
# 检查文件大小
du -sh backend/node_modules

# 如果太大，清理并重新安装
rm -rf backend/node_modules
cd backend && pnpm install --prod
```

### 7. Pages 部署后 Node.js 兼容性错误

**错误：** `Node.JS Compatibility Error - no nodejs_compat compatibility flag set`

**原因：** Next.js 使用了 Node.js API，需要启用兼容性标志

**解决方式1（推荐）：**

在 Cloudflare Dashboard 中设置：
1. 进入 **Pages** → 你的项目
2. **Settings** → **Functions**
3. 在 **Compatibility flags** 添加 `nodejs_compat`
4. 保存（立即生效，无需重新部署）

**解决方式2：**

更新 `frontend/wrangler.toml`：

```toml
name = "scaffold-frontend"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```

然后重新部署：
```bash
cd frontend
pnpm run pages:deploy
```

### 8. Pages 部署后 404

**原因：** Next.js 路由配置问题

**解决：**
确保 `frontend/wrangler.toml` 配置正确：

```toml
pages_build_output_dir = ".vercel/output/static"
```

---

## 📊 性能优化

### 1. 启用缓存

在 `backend/src/index.ts` 中添加：

```typescript
// 缓存静态响应
app.get('/health', (c) => {
	return c.json(
		{ status: 'healthy', timestamp: new Date().toISOString() },
		200,
		{ 'Cache-Control': 'public, max-age=60' }
	);
});
```

### 2. 压缩响应

Cloudflare 自动启用 Brotli/Gzip 压缩，无需额外配置。

### 3. 数据库优化

```sql
-- 添加索引（在迁移文件中）
CREATE INDEX idx_items_created_at ON items(created_at DESC);
```

---

## 🔒 安全建议

### 1. 环境变量管理

敏感信息使用 Cloudflare Secrets：

```bash
# 设置 Secret
wrangler secret put API_KEY

# 在代码中访问
const apiKey = c.env.API_KEY
```

### 2. 速率限制

```typescript
// backend/src/middleware/rate-limit.ts
import { Hono } from 'hono';

const rateLimit = new Map();

export const rateLimitMiddleware = () => {
	return async (c, next) => {
		const ip = c.req.header('CF-Connecting-IP') || 'unknown';
		const key = `${ip}:${(Date.now() / 60000) | 0}`;

		const count = rateLimit.get(key) || 0;
		if (count > 100) {
			return c.json({ error: 'Too many requests' }, 429);
		}

		rateLimit.set(key, count + 1);
		await next();
	};
};
```

### 3. HTTPS 强制

Cloudflare 默认强制 HTTPS，无需额外配置。

---

## 📈 监控和分析

### Cloudflare Analytics

1. 进入 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 `Workers & Pages` → `scaffold-api`
3. 查看：
   - 请求量
   - 错误率
   - P50/P99 延迟
   - CPU 使用时间

### 设置告警

1. 进入 `Notifications`
2. 创建新告警规则：
   - Worker 错误率 > 5%
   - Worker CPU 时间 > 50ms
   - D1 查询失败

---

## 💰 成本估算

### 免费额度（每天）

| 服务        | 免费额度       | 超出费用         |
| ----------- | -------------- | ---------------- |
| **Workers** | 100,000 请求   | $0.50 / 百万请求 |
| **Pages**   | 500 次构建     | $0.25 / 次构建   |
| **D1**      | 100,000 行读取 | $0.001 / 百万行  |
| **KV**      | 100,000 读取   | $0.50 / 百万读取 |

对于小型项目，免费额度完全够用！

---

## 🎯 部署检查清单

部署完成后，请检查：

- [ ] 后端 `/health` 返回 200
- [ ] 前端页面可以访问
- [ ] API 请求成功（无 CORS 错误）
- [ ] 数据库 CRUD 操作正常
- [ ] 多语言切换正常
- [ ] 响应式布局正常
- [ ] 自定义域名解析正常（如已配置）
- [ ] 日志和监控已启用

---

## 📚 参考资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [Hono.js 文档](https://hono.dev/)
- [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying)

---

## 🆘 获取帮助

遇到问题？

1. 查看 Cloudflare 日志：`wrangler tail scaffold-api`
2. 查看本项目 Issues
3. Cloudflare Discord 社区
4. Stack Overflow (标签：cloudflare-workers)

---

**部署愉快！🚀**
