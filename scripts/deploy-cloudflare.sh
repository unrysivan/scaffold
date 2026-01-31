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
    echo "Please run: wrangler d1 create journey-assistant-db"
    echo "And update the database_id in wrangler.toml"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    pnpm install
fi

# Upload secrets from .dev.vars - DISABLED by user request for manual dashboard configuration
# Secrets should be configured in Cloudflare Dashboard -> Settings -> Variables and Secrets
echo -e "${BLUE}ℹ️  Note: Secrets upload skipped. Please ensure secrets (OPENAI_API_KEY, etc.) are set in Cloudflare Dashboard.${NC}"

# Apply database migrations
echo "Run database migrations..."
pnpm wrangler d1 migrations apply journey-assistant-db --remote

# Deploy Workers
echo "Deploying Workers..."
# Capture output to file to preserve colors/formatting on screen while parsing
deploy_output=$(pnpm run deploy 2>&1 | tee /dev/tty)

# Extract URL from output (looking for https://*.workers.dev)
WORKER_URL=$(echo "$deploy_output" | grep -o "https://[a-zA-Z0-9.-]*\.workers\.dev" | tail -1)

if [ -z "$WORKER_URL" ]; then
    echo -e "${RED}⚠️  Could not auto-detect Worker URL.${NC}"
    WORKER_URL="https://scaffold-api.unrysivan.workers.dev"
    echo -e "Using fallback: ${WORKER_URL}"
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
# Build and deploy
echo "Building and deploying frontend..."
NEXT_PUBLIC_API_URL=$WORKER_URL pnpm run pages:build
pnpm wrangler pages deploy .vercel/output/static --project-name=journey-assistant-frontend

cd ..

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Visit Cloudflare dashboard to get your Pages URL"
echo "2. Update CORS_ORIGINS in backend wrangler.toml with your Pages URL"
echo "3. Redeploy backend: cd backend && pnpm run deploy"
echo ""
