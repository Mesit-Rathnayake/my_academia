# Quick Reference Guide - Docker & CI/CD Commands

## 🚀 Quick Start
```bash
# Copy environment file
cp .env.example .env

# Edit with your settings
nano .env

# Start everything
docker compose up -d

# View logs
docker compose logs -f
```

## 📦 Docker Compose Commands

### Basic Operations
```bash
docker compose up -d              # Start all services in background
docker compose down               # Stop all services
docker compose restart            # Restart all services
docker compose ps                 # List running services
docker compose logs -f            # Follow logs (all services)
docker compose logs -f backend    # Follow backend logs only
```

### Build & Deploy
```bash
docker compose build              # Build images
docker compose up -d --build      # Build and start
docker compose pull               # Pull latest images
docker compose down -v            # Stop and remove volumes
```

### Monitoring
```bash
docker compose ps                 # Service status
docker stats                      # Resource usage
docker compose top                # Running processes
```

## 🛠️ Using Make Commands (if available)

```bash
make help                # Show all available commands
make setup               # Initial setup
make build               # Build images
make start               # Start services
make stop                # Stop services
make logs                # View logs
make status              # Service status
make clean               # Remove everything
```

## 🌐 Access URLs

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:5000      |
| MongoDB  | mongodb://localhost:27017  |
| Jenkins  | http://localhost:8080      |

## 🔄 Jenkins Pipeline

### Manual Trigger
```bash
# In Jenkins UI:
1. Go to your pipeline
2. Click "Build Now"
```

### Webhook Setup (Auto-trigger on Git push)
```bash
# In Jenkins:
1. Go to pipeline configuration
2. Under "Build Triggers"
3. Check "GitHub hook trigger for GITScm polling"

# In GitHub:
1. Repository → Settings → Webhooks
2. Add webhook: http://your-jenkins-url/github-webhook/
```

## 📊 Database Management

### Backup
```bash
# Create backup
docker compose exec mongodb mongodump --out=/data/backup --db=my-academia

# Copy to host
docker cp my-academia-mongodb:/data/backup ./mongodb-backup
```

### Restore
```bash
# Copy backup to container
docker cp ./mongodb-backup my-academia-mongodb:/data/restore

# Restore
docker compose exec mongodb mongorestore /data/restore
```

### Connect to MongoDB
```bash
# Using mongosh
docker compose exec mongodb mongosh my-academia

# Show databases
show dbs

# Show collections
show collections

# Query users
db.users.find().pretty()
```

## 🐛 Troubleshooting

### View Logs
```bash
# All services
docker compose logs --tail=100

# Specific service
docker compose logs --tail=50 backend

# Follow in real-time
docker compose logs -f
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend

# Full restart with rebuild
docker compose down && docker compose up -d --build
```

### Check Container Health
```bash
# List containers
docker ps

# Inspect container
docker inspect my-academia-backend

# Check health status
docker inspect --format='{{.State.Health.Status}}' my-academia-backend
```

### Port Conflicts
```bash
# Check what's using a port
netstat -tulpn | grep :5000     # Linux
netstat -ano | findstr :5000    # Windows

# Kill process on port
kill -9 <PID>                   # Linux
taskkill /PID <PID> /F          # Windows
```

### Clean Up Issues
```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Complete cleanup
docker system prune -a --volumes -f
```

## 🔒 Security Commands

### Update Images
```bash
# Pull latest base images
docker compose pull

# Rebuild with latest dependencies
docker compose build --no-cache
```

### Scan for Vulnerabilities
```bash
# Using Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image my-academia-backend:latest
```

## 🚀 Deployment Workflow

### Development
```bash
1. Make changes to code
2. docker compose up -d --build
3. Test locally
4. Commit and push to Git
```

### Production (Manual)
```bash
1. SSH into server
2. cd /opt/my-academia
3. git pull origin main
4. docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Production (CI/CD - Automated)
```bash
1. Push to main branch
2. Jenkins automatically:
   - Runs tests
   - Builds images
   - Pushes to registry
   - Deploys to server
   - Performs health checks
```

## 📈 Monitoring

### View Resource Usage
```bash
# All containers
docker stats

# Specific container
docker stats my-academia-backend
```

### Check Disk Usage
```bash
# Docker disk usage
docker system df

# Detailed view
docker system df -v
```

### Health Checks
```bash
# Backend health
curl http://localhost:5000/api/health

# Frontend health
curl http://localhost:3000/health

# All services
docker compose ps
```

## 🔧 Environment Variables

### Required in .env
```env
JWT_SECRET=your_secret_key_here
REACT_APP_API_URL=http://localhost:5000
```

### Optional
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/my-academia
```

## 📝 Git Integration

### Useful Git Commands
```bash
# Clone repository
git clone <repo-url>

# Pull latest changes
git pull origin main

# Check status
git status

# Commit changes
git add .
git commit -m "Your message"
git push origin main
```

## 💡 Performance Tips

### Optimize Build Times
```bash
# Use BuildKit
DOCKER_BUILDKIT=1 docker compose build

# Build with parallel
docker compose build --parallel
```

### Reduce Image Size
```bash
# Multi-stage builds (already implemented)
# Remove dev dependencies in production
# Use alpine base images
```

### Optimize Startup
```bash
# Pre-pull images
docker compose pull

# Start without logs
docker compose up -d --quiet-pull
```

## 🎯 Common Tasks

### Add New Environment Variable
```bash
1. Add to .env file
2. Add to docker-compose.yml under service.environment
3. Restart: docker compose restart
```

### Update Dependencies
```bash
1. Update package.json
2. Rebuild: docker compose build --no-cache
3. Restart: docker compose up -d
```

### View Application Logs
```bash
# Last 100 lines
docker compose logs --tail=100

# Follow new logs
docker compose logs -f --since 5m

# Export to file
docker compose logs > application.log
```

---

## 📞 Quick Help

**Documentation**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions

**Issues?**
1. Check logs: `docker compose logs -f`
2. Check status: `docker compose ps`
3. Restart: `docker compose restart`
4. Clean rebuild: `docker compose down && docker compose up -d --build`
