# 环境配置说明

本文档说明项目中各个环境变量的作用和配置方式。

## 📋 环境变量配置原理

### Next.js 环境变量的特点

1. **`NEXT_PUBLIC_*` 变量是构建时注入的**
   - 在运行 `pnpm run build` 时，Next.js 会将这些变量的值**硬编码**到构建产物中
   - 部署后**无法更改**，必须重新构建才能生效

2. **环境文件读取顺序**（按优先级）
   - `.env.local` - 本地开发（被 Git 忽略）
   - `.env.production` - 生产环境（已删除，改用构建脚本）
   - `.env` - 所有环境的默认值

---

## 🔧 当前配置方案

### 前端（Frontend）

#### 本地开发
```bash
# 文件：frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8787
```

- 运行 `pnpm run dev`
- 前端调用本地 Workers 开发服务器（`http://localhost:8787`）

#### 生产部署
```json
// 文件：frontend/package.json
{
  "scripts": {
    "pages:build:prod": "NEXT_PUBLIC_API_URL=https://scaffold-api.unrysivan.workers.dev npx @cloudflare/next-on-pages",
    "pages:deploy": "npm run pages:build:prod && wrangler pages deploy ..."
  }
}
```

- 运行 `pnpm run pages:deploy`
- 构建时通过**命令行**注入 `NEXT_PUBLIC_API_URL`
- 前端调用生产 Worker（`https://scaffold-api.unrysivan.workers.dev`）

#### 代码中的使用
```typescript
// frontend/src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

// frontend/src/app/[locale]/page.tsx
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
```

- 优先使用环境变量
- 如果没有设置，默认使用 `localhost:8787`（本地开发）

---

### 后端（Backend）

#### 本地开发
```toml
# 文件：backend/wrangler.toml
[env.development]
[env.development.vars]
CORS_ORIGINS = "http://localhost:3000"
```

- 运行 `pnpm run dev`
- 允许来自 `http://localhost:3000` 的跨域请求

#### 生产部署
```toml
# 文件：backend/wrangler.toml
[vars]
ENVIRONMENT = "production"
CORS_ORIGINS = "https://scaffold-frontend.pages.dev"
```

- 运行 `pnpm run deploy`
- 允许来自 `https://scaffold-frontend.pages.dev` 的跨域请求

---

## 📌 关键点总结

### ✅ 正确做法

1. **本地开发**
   ```bash
   # 后端
   cd backend
   pnpm run dev  # 启动在 localhost:8787
   
   # 前端
   cd frontend
   pnpm run dev  # 自动读取 .env.local
   ```

2. **生产部署**
   ```bash
   # 后端
   cd backend
   pnpm run deploy
   
   # 前端
   cd frontend
   pnpm run pages:deploy  # 自动使用生产 API URL
   ```

### ❌ 常见错误

1. **在 `.env.local` 中设置生产 URL**
   - ❌ 错误：本地开发会调用生产 API
   - ✅ 正确：`.env.local` 只用于本地开发

2. **忘记重新构建前端**
   - ❌ 错误：修改环境变量后直接部署旧的构建产物
   - ✅ 正确：使用 `pages:deploy` 脚本，它会自动重新构建

3. **在 Cloudflare Dashboard 设置 `NEXT_PUBLIC_*` 变量**
   - ❌ 错误：这些变量是构建时注入的，Dashboard 设置无效
   - ✅ 正确：在构建脚本中通过命令行设置

---

## 🚀 部署检查清单

部署前确保：

- [ ] 后端 `wrangler.toml` 中的 `CORS_ORIGINS` 包含前端域名
- [ ] 前端 `package.json` 中 `pages:build:prod` 脚本的 API URL 正确
- [ ] 数据库迁移已在生产环境运行（`pnpm run db:migrate:prod`）
- [ ] 后端先部署，再部署前端

---

## 💡 快速参考

| 场景 | 前端地址 | 后端地址 | 配置文件 |
|------|---------|---------|---------|
| 本地开发 | `http://localhost:3000` | `http://localhost:8787` | `frontend/.env.local` |
| 生产环境 | `https://scaffold-frontend.pages.dev` | `https://scaffold-api.unrysivan.workers.dev` | `frontend/package.json` (构建脚本) |

---

## 🔍 故障排查

### 前端调用了错误的 API 地址

1. 检查浏览器 Network 面板，查看实际请求的 URL
2. 如果是 `localhost:8787`：
   - 可能使用了本地构建的产物
   - 解决：运行 `pnpm run pages:deploy` 重新构建并部署
3. 如果是 `localhost:8000`（旧的 FastAPI）：
   - 代码中有硬编码的地址
   - 解决：搜索 `localhost:8000` 并替换

### CORS 错误

1. 检查后端 `wrangler.toml` 中的 `CORS_ORIGINS`
2. 确保包含前端的完整域名（包括 `https://`）
3. 修改后重新部署后端：`pnpm run deploy`
