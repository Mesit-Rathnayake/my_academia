# Makefile for My Academia Project
# Simplifies Docker and development commands

.PHONY: help build start stop restart logs clean status test deploy

# Default target
.DEFAULT_GOAL := help

# Variables
COMPOSE=docker compose
COMPOSE_PROD=$(COMPOSE) -f docker-compose.yml -f docker-compose.prod.yml

help: ## Show this help message
	@echo "My Academia - Make Commands"
	@echo "=============================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Commands
install: ## Install dependencies for both frontend and backend
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

dev-backend: ## Run backend in development mode
	cd backend && npm run dev

dev-frontend: ## Run frontend in development mode
	cd frontend && npm start

test-backend: ## Run backend tests
	cd backend && npm test

test-frontend: ## Run frontend tests
	cd frontend && npm test

test-all: ## Run all tests
	@echo "Running backend tests..."
	cd backend && npm test
	@echo "Running frontend tests..."
	cd frontend && npm test

# Docker Commands
build: ## Build Docker images
	$(COMPOSE) build

start: ## Start all services
	$(COMPOSE) up -d

stop: ## Stop all services
	$(COMPOSE) down

restart: ## Restart all services
	$(COMPOSE) restart

logs: ## View logs from all services
	$(COMPOSE) logs -f

logs-backend: ## View backend logs
	$(COMPOSE) logs -f backend

logs-frontend: ## View frontend logs
	$(COMPOSE) logs -f frontend

logs-db: ## View MongoDB logs
	$(COMPOSE) logs -f mongodb

status: ## Show status of all services
	$(COMPOSE) ps

clean: ## Stop and remove containers, networks, and volumes
	$(COMPOSE) down -v

rebuild: ## Rebuild and restart all services
	$(COMPOSE) down
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d

# Production Commands
prod-build: ## Build for production
	$(COMPOSE_PROD) build

prod-start: ## Start production services
	$(COMPOSE_PROD) up -d

prod-stop: ## Stop production services
	$(COMPOSE_PROD) down

prod-logs: ## View production logs
	$(COMPOSE_PROD) logs -f

# Database Commands
db-shell: ## Connect to MongoDB shell
	$(COMPOSE) exec mongodb mongosh my-academia

db-backup: ## Backup MongoDB database
	@echo "Creating database backup..."
	$(COMPOSE) exec mongodb mongodump --out=/data/backup --db=my-academia
	@echo "Backup created in MongoDB container at /data/backup"

db-restore: ## Restore MongoDB database from backup
	@echo "Restoring database from backup..."
	$(COMPOSE) exec mongodb mongorestore /data/backup

# Maintenance Commands
health: ## Check health of all services
	@echo "Checking service health..."
	@curl -f http://localhost:5000/api/health && echo "✓ Backend is healthy" || echo "✗ Backend is unhealthy"
	@curl -f http://localhost:3000/health && echo "✓ Frontend is healthy" || echo "✗ Frontend is unhealthy"

prune: ## Remove unused Docker resources
	docker system prune -f

prune-all: ## Remove all unused Docker resources including volumes
	docker system prune -af --volumes

shell-backend: ## Open shell in backend container
	$(COMPOSE) exec backend sh

shell-frontend: ## Open shell in frontend container
	$(COMPOSE) exec frontend sh

# Setup Commands
setup: ## Initial setup - copy .env and install dependencies
	@if [ ! -f .env ]; then \
		echo "Creating .env from .env.example..."; \
		cp .env.example .env; \
		echo "✓ .env file created"; \
		echo "⚠ Please edit .env file with your configuration"; \
	else \
		echo ".env file already exists"; \
	fi

docker-setup: setup build start ## Complete Docker setup
	@echo "✓ Docker setup complete!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:5000"

# CI/CD Commands
ci-test: ## Run CI tests
	cd backend && npm ci && npm test
	cd frontend && npm ci && npm test

ci-build: ## Build for CI
	$(COMPOSE) build --no-cache

ci-deploy: ## Deploy (used by Jenkins)
	$(COMPOSE) pull
	$(COMPOSE) down
	$(COMPOSE) up -d

# Monitoring
stats: ## Show Docker container stats
	docker stats

inspect-backend: ## Inspect backend container
	docker inspect my-academia-backend

inspect-frontend: ## Inspect frontend container
	docker inspect my-academia-frontend

inspect-db: ## Inspect MongoDB container
	docker inspect my-academia-mongodb
