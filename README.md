# Scaffold - 全栈快速开发框架

基于 Next.js + FastAPI + PostgreSQL 的全栈快速开发脚手架。

## 技术栈

### 前端
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- next-intl (多语言)
- TypeScript
- pnpm

### 后端
- FastAPI
- SQLAlchemy 2.0 (异步)
- Alembic (数据库迁移)
- PostgreSQL
- Pydantic v2

## 快速开始

### 环境要求
- Docker & Docker Compose
- Node.js 18+ (本地开发)
- Python 3.11+ (本地开发)
- pnpm

### 1. 克隆并配置环境变量

```bash
cp .env.example .env
```

### 2. 启动开发环境

```bash
# 使用 Docker Compose 启动所有服务
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# 或分别启动
docker-compose up db  # 仅启动数据库
```

### 3. 本地开发 (可选)

**前端:**
```bash
cd frontend
pnpm install
pnpm dev
```

**后端:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 4. 生产部署

```bash
docker-compose up -d --build
```

## 项目结构

```
scaffold/
├── frontend/                 # Next.js 前端
│   ├── src/
│   │   ├── app/             # App Router 路由
│   │   ├── components/      # 通用组件
│   │   ├── lib/             # 工具函数
│   │   └── messages/        # 多语言文件
│   └── ...
│
├── backend/                  # FastAPI 后端
│   ├── app/
│   │   ├── api/             # API 路由
│   │   ├── models/          # 数据库模型
│   │   ├── schemas/         # Pydantic 模型
│   │   └── services/        # 业务逻辑
│   ├── alembic/             # 数据库迁移
│   └── ...
│
├── docker-compose.yml        # 生产环境配置
├── docker-compose.dev.yml    # 开发环境覆盖
└── .env.example              # 环境变量模板
```

## API 文档

启动后端后访问:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 数据库迁移

```bash
cd backend

# 创建迁移
alembic revision --autogenerate -m "描述"

# 执行迁移
alembic upgrade head

# 回滚
alembic downgrade -1
```

## 多语言

支持的语言:
- 中文 (zh)
- English (en)

添加新语言:
1. 在 `frontend/src/messages/` 添加语言文件
2. 更新 `frontend/src/i18n.ts` 配置
