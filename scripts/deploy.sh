#!/usr/bin/env bash
# ==============================================================================
# My Academia - Production Deployment Automation Script (Bash)
# ==============================================================================
set -e

echo "=========================================="
echo "🚀 Starting My Academia Automated Deployment"
echo "=========================================="

# 1. Check prerequisite environment file
if [ ! -f .env ]; then
  echo "⚠️ .env file not found! Copying from .env.example..."
  cp .env.example .env
  echo "👉 Please update your secrets and GEMINI_API_KEY in .env before running in production."
fi

# 2. Pull latest container images and build services
echo "🐳 Building Docker container images..."
docker compose build --parallel

# 3. Start PostgreSQL and AI service first
echo "🗄️ Starting database and supporting services..."
docker compose up -d postgres ai-service

# 4. Wait for PostgreSQL to become healthy
echo "⏳ Waiting for PostgreSQL database readiness..."
until docker compose exec -T postgres pg_isready -U postgres -d my_academia > /dev/null 2>&1; do
  echo "Waiting for database connection..."
  sleep 2
done
echo "✅ Database is ready."

# 5. Run Prisma Database Migrations
echo "📦 Running Prisma database migrations in backend..."
docker compose run --rm backend npx prisma db push --skip-generate || true

# 6. Launch full microservices stack
echo "🌐 Launching full microservices stack..."
docker compose up -d --remove-orphans

# 7. Verification & Health Probing
echo "🩺 Performing health check probes..."
sleep 5

if command -v node > /dev/null 2>&1; then
  node scripts/healthcheck.js
else
  curl -s -f http://localhost:8080/ma-api/v1/health || (echo "❌ Backend health check failed!" && exit 1)
  curl -s -f http://localhost:8080/ma-ai/v1/health || (echo "❌ AI Service health check failed!" && exit 1)
  echo "✅ Gateway & Services are healthy!"
fi

echo "=========================================="
echo "🎉 Deployment completed successfully!"
echo "📍 Access application via API Gateway: http://localhost:8080"
echo "=========================================="
