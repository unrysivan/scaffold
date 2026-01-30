# Scaffold - Cloudflare 全栈框架

基于 **Next.js + Hono.js + Cloudflare D1** 的全栈快速开发脚手架。

## 技术栈

**前端**

- Next.js 14 (App Router)
- Tailwind CSS
- next-intl (国际化)
- TypeScript

**后端**

- Hono.js
- Drizzle ORM
- Zod (数据验证)
- TypeScript

**部署**

- Cloudflare Workers (后端)
- Cloudflare Pages (前端)
- Cloudflare D1 (数据库)

## 项目结构

```
scaffold/
├── frontend/              # Next.js 前端
│   ├── src/
│   │   ├── app/[locale]/ # 多语言路由
│   │   ├── components/   # UI 组件
│   │   ├── lib/          # 工具函数
│   │   └── messages/     # i18n 文件
│   └── wrangler.toml
│
├── backend/               # Hono.js 后端
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   ├── services/     # 业务逻辑
│   │   ├── db/           # Drizzle ORM
│   │   ├── schemas/      # Zod 验证
│   │   └── middleware/   # 中间件
│   └── wrangler.toml
│
└── scripts/              # 部署脚本
    ├── setup-cloudflare.sh
    └── deploy-cloudflare.sh
```

## 📚 重要文档

- **[ENV.md](./ENV.md)** - 🔑 环境配置详细说明（**强烈推荐阅读**）
- **[DEPLOY.md](./DEPLOY.md)** - 🚀 完整部署指南

## 快速开始

### 本地开发

**1. 安装依赖**

```bash
# 后端
cd backend
pnpm install

# 前端
cd ../frontend
pnpm install
```

**2. 配置环境变量**

```bash
# 后端：创建 .dev.vars
cd backend
echo "ENVIRONMENT=development" > .dev.vars
echo "CORS_ORIGINS=http://localhost:3000" >> .dev.vars

# 前端：创建 .env.local
cd ../frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8787" > .env.local
```

**3. 初始化数据库**

```bash
cd backend
pnpm run db:migrate
```

**4. 启动服务**

```bash
# 后端 (终端1)
cd backend
pnpm run dev    # http://localhost:8787

# 前端 (终端2)
cd frontend
pnpm dev        # http://localhost:3000
```

### 部署到 Cloudflare

**快速部署：**

```bash
# 1. 初始化 Cloudflare
./scripts/setup-cloudflare.sh

# 2. 部署
./scripts/deploy-cloudflare.sh
```

**📖 完整部署文档：[DEPLOY.md](./DEPLOY.md)**

包含详细的：

- 手动部署步骤
- 环境配置管理
- 自定义域名设置
- 数据库备份恢复
- 性能优化建议
- 常见问题排查

## API 示例

```bash
# Health check
curl http://localhost:8787/health

# List items
curl http://localhost:8787/api/v1/items

# Create item
curl -X POST http://localhost:8787/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","description":"描述"}'
```

## 注意事项

**Yarn PnP 冲突**

如果遇到依赖解析错误：

```bash
# 禁用全局 Yarn PnP（不影响其他项目）
mv ~/.pnp.cjs ~/.pnp.cjs.disabled
```

**包管理器**

项目统一使用 `pnpm`，已配置淘宝镜像加速。

## 许可证

MIT
