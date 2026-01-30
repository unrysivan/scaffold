#!/bin/bash

set -e

echo "🔧 Setting up Cloudflare project..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}Step 1: Login to Cloudflare${NC}"
echo "------------------------------------"
wrangler login

echo ""
echo -e "${BLUE}Step 2: Create D1 Database${NC}"
echo "------------------------------------"
echo "Creating database 'scaffold-db'..."
wrangler d1 create scaffold-db

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Copy the database_id from above output${NC}"
echo "Update it in backend/wrangler.toml"
echo ""
read -p "Press Enter after updating wrangler.toml..."

echo ""
echo -e "${BLUE}Step 3: Run Database Migrations${NC}"
echo "------------------------------------"
cd backend
pnpm install
echo "Running migrations..."
pnpm run db:migrate:prod

cd ..

echo ""
echo -e "${BLUE}Step 4: Install Frontend Dependencies${NC}"
echo "------------------------------------"
cd frontend
pnpm install

cd ..

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Test locally:"
echo "   - Backend: cd backend && pnpm run dev"
echo "   - Frontend: cd frontend && pnpm dev"
echo ""
echo "2. Deploy to production:"
echo "   - Run: ./scripts/deploy-cloudflare.sh"
echo ""
