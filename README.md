# My Academia - QA Testing Project

A comprehensive student management system demonstrating enterprise-level Quality Assurance practices.

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)
```bash
# Copy environment file
cp .env.example .env

# Start all services (Frontend, Backend, MongoDB)
docker compose up -d

# View logs
docker compose logs -f
```

Access at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: localhost:27017

For detailed Docker setup, see **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

### Option 2: Manual Setup

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend  
```bash
cd frontend
npm install
npm start
```

## 🧪 Run Tests

```bash
cd backend
npm test                    # TDD unit tests
npm run test:bdd           # BDD cucumber tests  
npm run test:api           # API integration tests

cd ../frontend
npm run selenium-login     # Selenium UI tests
```

## 🐳 Docker & CI/CD

This project includes complete Docker containerization and Jenkins CI/CD pipeline:

### Docker Files
- `Dockerfile` (Backend & Frontend) - Multi-stage optimized builds
- `docker-compose.yml` - Local development orchestration
- `docker-compose.prod.yml` - Production configuration
- `Jenkinsfile` - Complete CI/CD pipeline

### Quick Commands
```bash
# Using Docker Compose
docker compose up -d          # Start all services
docker compose logs -f        # View logs
docker compose down           # Stop services

# Using Makefile (if available)
make setup                    # Initial setup
make start                    # Start services
make logs                     # View logs

# Using convenience scripts
./docker-setup.sh            # Linux/Mac
docker-setup.bat             # Windows
```

### Documentation
- **[🚀 Deployment Guide](DEPLOYMENT_GUIDE.md)** - Complete Docker & Jenkins setup
- **[⚡ Quick Reference](QUICK_REFERENCE.md)** - Common commands cheat sheet
## 📚 Complete Documentation

**All comprehensive documentation is located in the [`documentation/`](documentation/) folder:**

- **[📋 Documentation Index](documentation/INDEX.md)** - Complete overview of all documents
- **[🎤 Presentation Script](documentation/PRESENTATION_SCRIPT.md)** - Ready-to-use presentation with demo commands
- **[🔧 CI/CD Pipeline Guide](documentation/CICD_PIPELINE_BRIEFING.md)** - Line-by-line pipeline explanation

## 🎯 Key Achievements

✅ **9 Testing Types**: TDD, BDD, Selenium, API, CI/CD, JMeter, Security, Quality Metrics, SonarQube  
✅ **0.0 Defects per 1000 LOC** (industry benchmark: <10)  
✅ **100% Test Coverage** on critical business logic  
✅ **0 Critical Security Vulnerabilities**  
✅ **~200ms Response Time** under load  

## 🛡️ Security

- OWASP Top 10 compliant
- JWT-based authentication with rate limiting
- Input validation and sanitization
- Comprehensive security testing documented

## 📊 Architecture

- **Frontend**: React.js with modern UI components (Nginx in production)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Testing**: Jest, Selenium, Cucumber, JMeter, SonarQube
- **CI/CD**: Jenkins with automated Docker builds and deployments
- **Containerization**: Docker & Docker Compose for consistent environments

---

**For detailed documentation, demos, and presentation materials, see the [`documentation/`](documentation/) folder.**