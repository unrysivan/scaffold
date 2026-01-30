#!/bin/bash

set -e

echo "🚀 Deploying to Cloudflare..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}Step 1: Deploying Backend (Workers)${NC}"
echo "------------------------------------"
cd backend

# Check if database_id is set
if ! grep -q "database_id = \"[^\"]\+\"" wrangler.toml; then
    echo -e "${RED}⚠️  Warning: database_id is empty in wrangler.toml${NC}"
    echo "Please run: wrangler d1 create scaffold-db"
    echo "And update the database_id in wrangler.toml"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    pnpm install
fi

# Deploy Workers
echo "Deploying Workers..."
pnpm run deploy

WORKER_URL=$(wrangler deployments list --name scaffold-api 2>/dev/null | grep "https://" | head -1 | awk '{print $2}')
if [ -z "$WORKER_URL" ]; then
    WORKER_URL="https://scaffold-api.your-subdomain.workers.dev"
fi

echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
echo "Worker URL: $WORKER_URL"

cd ..

echo ""
echo -e "${BLUE}Step 2: Deploying Frontend (Pages)${NC}"
echo "------------------------------------"
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    pnpm install
fi

# Update API URL
echo "Updating API URL to: $WORKER_URL"
echo "NEXT_PUBLIC_API_URL=$WORKER_URL" > .env.production

# Build and deploy
echo "Building and deploying frontend..."
pnpm run pages:build
pnpm wrangler pages deploy .vercel/output/static --project-name=scaffold-frontend

cd ..

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Visit Cloudflare dashboard to get your Pages URL"
echo "2. Update CORS_ORIGINS in backend wrangler.toml with your Pages URL"
echo "3. Redeploy backend: cd backend && pnpm run deploy"
echo ""
