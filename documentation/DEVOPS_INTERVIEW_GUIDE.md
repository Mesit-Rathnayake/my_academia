# MY ACADEMIA - DEVOPS & ARCHITECTURE INTERVIEW GUIDE

## 1️⃣ TOOLS & TECHNOLOGIES USED

### Frontend Stack
- **React.js** (Create React App) - UI framework
- **Nginx** (Alpine) - Static file server & reverse proxy
- **Node.js 18 Alpine** - Build-time dependency manager

### Backend Stack
- **Node.js 18 Alpine** - Runtime
- **Express.js** - API framework
- **MongoDB 7.0** - NoSQL database

### DevOps & Infrastructure
- **Docker** - Containerization (multi-stage builds)
- **Docker Compose** - Service orchestration (3 services: mongo, backend, frontend)
- **Jenkins** - CI/CD automation (Declarative Pipeline)
- **Git/GitHub** - Version control
- **SSH** - Remote deployment
- **ngrok** - Tunnel for internet exposure (CGNAT workaround)

---

## 2️⃣ ARCHITECTURE OVERVIEW

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE                         │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────┐  ┌──────────────────┐               │
│  │  FRONTEND       │  │  BACKEND         │               │
│  │  (Nginx:80)     │  │  (Node:5001)     │               │
│  │  React Build    │  │  Express API     │               │
│  │  Multi-Stage    │  │  JWT Auth        │               │
│  └────────┬────────┘  └──────────┬───────┘               │
│           │                       │                       │
│           │       /api/ proxy     │                       │
│           └──────────────────────┘                       │
│                     │                                     │
│           ┌─────────▼─────────┐                          │
│           │    MONGODB        │                          │
│           │    (Port 27017)   │                          │
│           └───────────────────┘                          │
│                                                            │
└──────────────────────────────────────────────────────────┘

         Docker Compose Network: my-academia-network
              (Bridge driver for service discovery)
```

### Key Design Points
- **Multi-stage frontend build** (Node builder → Nginx runtime)
- **Nginx reverse proxy** for `/api/` routes to backend
- **Service discovery** via Docker DNS (backend:5001)
- **Health checks** on all 3 services (30s intervals)
- **Environment variables** for port, database URI, JWT secret
- **Volume mounts** for database persistence and live code updates

---

## 3️⃣ AUTHENTICATION FLOW

### User Registration & Login Flow

```
SIGNUP/LOGIN REQUEST
         │
         ▼
┌─────────────────────────────────┐
│  authController.register/login  │
│  (Check user in MongoDB)        │
└──────────────┬──────────────────┘
               │
         ┌─────▼──────┐
         │ Password   │
         │ exists?    │
         └─────┬──────┘
            NO │ YES
               │  │
               │  ▼
               │ bcrypt.compare()  (password hashing)
               │  │
               │  ▼ Match?
               │  ├─ YES: Generate JWT
               │  └─ NO: Invalid credentials
               │
         ┌─────▼──────────────────────┐
         │  JWT.sign() with claims:   │
         │  - _id (user ID)           │
         │  - exp: 24 hours           │
         │  - iss: "my-academia"      │
         │  - aud: "my-academia-users"│
         │  - algorithm: HS256        │
         └──────────┬─────────────────┘
                    │
              ┌─────▼─────┐
              │   Token   │
              │  to Client│
              └───────────┘
```

### Protected Routes Authentication

```
Request to /api/modules
         │
    ┌────▼────────────┐
    │ auth middleware │
    │ extract token   │
    └────┬────────────┘
         │
    ┌────▼──────────────┐
    │ JWT.verify()      │
    │ - Check signature │
    │ - Verify issuer   │
    │ - Verify audience │
    │ - Check expiry    │
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │ Find user in DB   │
    │ (verify exists)   │
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │ Pass to controller│
    │ req.user = user   │
    └───────────────────┘
```

---

## 4️⃣ SECURITY MEASURES IMPLEMENTED

| Security Aspect | Implementation | OWASP Standard |
|---|---|---|
| **Password Storage** | bcrypt hashing (10 salt rounds) | A02:2021 - Cryptographic Failures |
| **Authentication** | JWT with HS256 algorithm | A07:2021 - Identification & Auth |
| **Token Claims** | issuer, audience, expiration (24h) | Prevent algorithm confusion attacks |
| **API Access** | Bearer token validation | A01:2021 - Broken Access Control |
| **Error Messages** | Generic "Invalid credentials" (no user enumeration) | A09:2021 - Information Disclosure |
| **CORS** | Enabled for frontend-backend communication | Cross-origin requests |
| **Environment Variables** | JWT_SECRET via .env (not hardcoded) | Secrets management |
| **Input Validation** | Body parser + route validation | A03:2021 - Injection |
| **Service Health Checks** | Automated restart on failure | Availability & resilience |

### Authentication Middleware Details

```javascript
// Key Security Features:
1. Bearer token extraction from Authorization header
2. JWT.verify() with explicit algorithm (HS256)
3. Issuer validation: "my-academia"
4. Audience validation: "my-academia-users"
5. User existence check in database
6. Secure error handling (no token details leaked)
```

### Password Security

```javascript
// bcryptjs implementation:
- Salt rounds: 10
- Pre-save hashing: UserSchema.pre('save')
- Comparison method: bcrypt.compare()
- One-way encryption (irreversible)
```

---

## 5️⃣ CI/CD PIPELINE (JENKINS)

### Jenkins Workflow Diagram

```
┌──────────────────────────────────────────────────────┐
│ Git Push to main → GitHub Webhook                    │
└──────────────┬───────────────────────────────────────┘
               │
        ┌──────▼──────┐
        │  Stage 1    │
        │  Checkout   │
        │  (SCM)      │
        └──────┬──────┘
               │
        ┌──────▼──────────────────┐
        │  Stage 2                │
        │  Build Docker Images    │
        │  - Backend:latest       │
        │  - Frontend:latest      │
        └──────┬───────────────────┘
               │
        ┌──────▼──────────────────┐
        │  Stage 3                │
        │  Deploy to Server       │
        │  - SSH to 192.168.1.105 │
        │  - git pull             │
        │  - docker compose up -d │
        │  - wait 10s             │
        └──────┬───────────────────┘
               │
        ┌──────▼──────────────────┐
        │  Stage 4                │
        │  Health Check           │
        │  - /api/health endpoint │
        │  - HTTP 200 response    │
        └──────┬───────────────────┘
               │
        ┌──────▼──────────────────┐
        │  Pipeline Success ✓     │
        │  App is live & healthy  │
        └─────────────────────────┘
```

### Jenkins Configuration

- **Deployment Server:** 192.168.1.105
- **Deploy User:** mesith
- **App Path:** /opt/my-academia
- **Authentication:** SSH keys (passwordless)
- **Automatic Restarts:** `restart: unless-stopped`
- **Docker Username:** mesith-30

### Pipeline Stages

| Stage | Action | Command |
|-------|--------|---------|
| **Checkout** | Clone repository | `checkout scm` |
| **Build** | Create Docker images | `docker build -t username/app:latest` |
| **Deploy** | SSH to server & run compose | `ssh deploy && docker compose up -d` |
| **Health Check** | Verify service availability | `curl http://localhost:5001/api/health` |

---

## 6️⃣ DOCKER & CONTAINERIZATION STRATEGY

### Backend Dockerfile (Node.js)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3
CMD ["npm", "start"]
```

**Key Features:**
- ✓ Alpine base (lightweight, 47MB vs 900MB+)
- ✓ npm ci --only=production (faster, deterministic)
- ✓ EXPOSE 5001
- ✓ HEALTHCHECK (auto-restart on failure)

### Frontend Dockerfile (Multi-Stage Build)

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

**Key Features:**
- ✓ Multi-stage (builder → runtime separation)
- ✓ npm install in build stage (not in runtime)
- ✓ COPY --from=builder (only /build folder)
- ✓ nginx.conf (reverse proxy /api/)
- ✓ Reduces final image size (nginx:alpine ~40MB)

### Docker Compose Features

- **Service Dependencies:** Backend waits for MongoDB health
- **Health Checks:** All 3 services have ping/endpoint tests
- **Networking:** Bridge network (service DNS discovery)
- **Volumes:** MongoDB persistence + live code mounts
- **Environment Injection:** PORT, MONGODB_URI, JWT_SECRET, REACT_APP_API_URL
- **Port Mapping:** 
  - 27017:27017 (MongoDB)
  - 5001:5001 (Backend API)
  - 3000:80 (Frontend)

---

## 7️⃣ NETWORKING & DEPLOYMENT

### Local Development Environment

- Frontend on `localhost:3000` → proxies `/api/*` to `localhost:5001`
- Backend on `localhost:5001` (API)
- MongoDB on `localhost:27017`

### Production Deployment (Server @ 192.168.1.105)

1. Jenkins pulls code from GitHub
2. Builds Docker images
3. SSH deploys to server
4. Docker Compose starts all services on dedicated VM
5. Nginx handles static + reverse proxy (same-origin API calls)
6. ngrok tunnel exposes public HTTPS URL (CGNAT workaround)

### Network Security Considerations

- **CGNAT Detected:** WAN IP: 100.105.22.92 (blocks direct inbound)
- **SSH Key-Based Auth:** No passwords in Jenkins
- **Environment Variables:** Secrets not in Dockerfile/compose
- **Port Mapping:** Explicit mapping for service access
- **Service Discovery:** Docker DNS for internal communication

---

## 🎯 INTERVIEW TALKING POINTS

### Q: "Tell us about your containerization strategy"

**Answer:**  
"I used Docker with multi-stage builds for the frontend to optimize image size. The frontend stage builds the React app with Node, then only the `/build` output is copied to an Nginx Alpine runtime image (~40MB total). The backend uses node:18-alpine with `npm ci --only=production` for deterministic builds.

Docker Compose orchestrates three services: MongoDB, Node backend, and Nginx frontend. Each service has health checks with automatic restarts, and they communicate via a Bridge network with service DNS discovery. This ensures reliability and makes the system self-healing."

### Q: "How did you handle API communication between frontend and backend?"

**Answer:**  
"Initially, the frontend had hardcoded API URLs to `localhost:5000`. To solve this in production:

1. Updated React pages to use environment variables (`REACT_APP_API_URL`)
2. Added an Nginx reverse proxy in the frontend container that forwards `/api/*` requests to the backend service (`backend:5001`)
3. Frontend now makes same-origin requests to `/api/*`, and Nginx internally routes them to the backend

This means the same ngrok URL serves both static frontend assets and proxied API requests—no need for dual tunnels."

### Q: "What security measures did you implement?"

**Answer:**  
"I implemented multiple layers of security:

1. **Authentication:** JWT with HS256 algorithm, including issuer/audience claims and 24-hour expiry
2. **Password Security:** bcrypt hashing with 10 salt rounds before database storage
3. **Token Validation:** Both signature verification and user existence check in database
4. **Error Handling:** Generic error messages to prevent user enumeration
5. **Secrets Management:** JWT_SECRET stored in environment variables, never hardcoded
6. **Input Validation:** Body parser middleware and route-level validation
7. **CORS:** Configured for cross-origin frontend-backend requests
8. **Health Checks:** Automatic service restarts on failure"

### Q: "How does your CI/CD pipeline work?"

**Answer:**  
"My Jenkins pipeline is declarative and runs on webhook triggers from GitHub commits:

1. **Checkout:** SCM polls GitHub and clones the latest code
2. **Build:** Runs `docker build` for both backend and frontend images, tagging them with `:latest`
3. **Deploy:** SSHs to the production server (192.168.1.105) and runs:
   - `git pull origin main`
   - `docker compose down && docker compose up -d` (re-creates containers with new images)
   - Waits 10 seconds for services to stabilize
4. **Health Check:** Validates the `/api/health` endpoint returns HTTP 200

The entire pipeline is automated—no manual steps between git push and production deployment."

### Q: "How did you expose the app to the internet?"

**Answer:**  
"I configured the home router with port forwarding (external port 8080 → container port 3000, 5001 → 5001). However, I discovered the WAN IP was in a CGNAT range (100.105.22.92), which blocks inbound traffic regardless of forwarding configuration.

To solve this, I used ngrok as a tunneling solution:
- Runs on the server: `ngrok http 3000 --log stdout`
- Creates a public HTTPS URL that forwards to the frontend
- Nginx reverse proxy on the frontend handles `/api/*` routing to the backend transparently
- Users access the app via the single ngrok HTTPS URL with all API calls working through the proxy"

### Q: "What would you do differently in a production environment?"

**Answer:**  
"For production hardening, I would:

1. **Container Registry:** Push images to Docker Hub or private registry for versioning and rollback
2. **Secrets Management:** Use Docker secrets or HashiCorp Vault instead of .env files
3. **Monitoring:** Integrate Prometheus/Grafana for metrics and alerting
4. **Logging:** Centralize logs with ELK stack or Splunk
5. **Database Backups:** Implement automated MongoDB backups
6. **SSL/TLS:** Use proper certificates (Let's Encrypt) instead of ngrok
7. **Load Balancing:** Deploy multiple backend replicas with load balancer
8. **Infrastructure as Code:** Migrate Docker Compose to Kubernetes for scaling
9. **Network Segmentation:** Isolate database tier from public internet
10. **Automated Testing:** Add unit/integration tests to pipeline before deployment"

---

## 📊 PERFORMANCE & RELIABILITY

### Image Sizes
- `node:18-alpine`: ~160MB
- `nginx:alpine`: ~40MB
- `mongo:7.0`: ~500MB
- **Total Optimized:** ~1.2GB vs ~2.5GB (unoptimized)

### Health Check Intervals
- MongoDB: 10s (retries: 5)
- Backend: 30s (retries: 3)
- Frontend: 30s (retries: 3)
- **Auto-restart:** enabled on failure

### Deployment Time
- Image build: ~2-3 minutes
- Deploy & health checks: ~30 seconds
- **Container startup:** ~5-10 seconds

---

## ✅ KEY ACHIEVEMENTS

1. ✓ Full containerization with Docker & Compose
2. ✓ Automated CI/CD pipeline with Jenkins
3. ✓ OWASP-compliant authentication (JWT + bcrypt)
4. ✓ Multi-stage frontend builds (optimized image size)
5. ✓ Service health checks & auto-recovery
6. ✓ Nginx reverse proxy for unified API routing
7. ✓ SSH-based deployments (no password exposure)
8. ✓ Internet exposure via ngrok (CGNAT workaround)
9. ✓ Responsive UI across devices
10. ✓ Production-ready Docker Compose setup

---

**Good luck with your DevOps Internship Interview! 🚀**
