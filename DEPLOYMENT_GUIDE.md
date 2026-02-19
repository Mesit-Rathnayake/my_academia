# Docker & CI/CD Deployment Guide

This guide will help you containerize and deploy the My Academia application using Docker, Docker Compose, and Jenkins CI/CD.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start with Docker Compose](#quick-start-with-docker-compose)
3. [Manual Docker Build](#manual-docker-build)
4. [Jenkins CI/CD Setup](#jenkins-cicd-setup)
5. [Deployment to Server](#deployment-to-server)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### On Your Server Laptop:
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Jenkins**: Version 2.3 or higher (for CI/CD)
- **Git**: For version control

### Install Docker on Ubuntu/Debian:
```bash
# Update packages
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### Install Docker on Windows:
- Download and install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)

---

## 🚀 Quick Start with Docker Compose

### Step 1: Configure Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set your values
nano .env
```

Required environment variables:
```env
JWT_SECRET=your_super_secure_jwt_secret_key_here
REACT_APP_API_URL=http://localhost:5001
```

### Step 2: Build and Run
```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

### Step 3: Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **MongoDB**: localhost:27017

### Step 4: Stop the Application
```bash
# Stop all services
docker compose down

# Stop and remove volumes (WARNING: This deletes database data)
docker compose down -v
```

---

## 🔧 Manual Docker Build

### Build Backend Image
```bash
cd backend
docker build -t my-academia-backend:latest .
docker run -d \
  --name backend \
   -p 5001:5001 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/my-academia \
  -e JWT_SECRET=your_secret_key \
  my-academia-backend:latest
```

### Build Frontend Image
```bash
cd frontend
docker build -t my-academia-frontend:latest .
docker run -d \
  --name frontend \
  -p 3000:80 \
  my-academia-frontend:latest
```

---

## 🔄 Jenkins CI/CD Setup

### 1. Install Jenkins on Your Server

#### Ubuntu/Debian:
```bash
# Install Java
sudo apt update
sudo apt install openjdk-11-jdk -y

# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install jenkins -y

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

#### Access Jenkins:
- Navigate to: http://your-server-ip:8080
- Enter the initial admin password
- Install suggested plugins

### 2. Configure Jenkins

#### Install Required Plugins:
1. Go to **Manage Jenkins** → **Plugin Manager**
2. Install these plugins:
   - Docker Pipeline
   - Docker plugin
   - Git plugin
   - SSH Agent plugin
   - Email Extension plugin (optional)

#### Configure Docker in Jenkins:
1. **Add Docker to Jenkins user**:
```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

2. **Configure Docker in Jenkins**:
   - Go to **Manage Jenkins** → **Global Tool Configuration**
   - Add Docker installation
   - Name: `docker`
   - Install automatically: Check this

#### Add Credentials:
1. Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**

2. **Add Docker Hub credentials**:
   - Kind: Username with password
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password or access token
   - ID: `dockerhub-credentials`

3. **Add SSH credentials for deployment**:
   - Kind: SSH Username with private key
   - Username: Your server username
   - Private Key: Add your SSH private key
   - ID: `deploy-ssh-key`

### 3. Create Jenkins Pipeline

#### Option A: Using Jenkinsfile from SCM
1. **Create New Item**:
   - Click **New Item**
   - Enter name: `my-academia-pipeline`
   - Select **Pipeline**
   - Click **OK**

2. **Configure Pipeline**:
   - Under **Pipeline** section:
     - Definition: Pipeline script from SCM
     - SCM: Git
     - Repository URL: Your Git repository URL
     - Credentials: Add if private repo
     - Branch: `*/main`
     - Script Path: `Jenkinsfile`

3. **Save and Build**:
   - Click **Save**
   - Click **Build Now**

#### Option B: Direct Pipeline Script
- Copy the content from `Jenkinsfile`
- In Pipeline section, select **Pipeline script**
- Paste the content

### 4. Configure Environment Variables in Jenkins

Edit the `Jenkinsfile` or set in Jenkins configuration:
```groovy
environment {
    DOCKER_USERNAME = 'your-dockerhub-username'
    DEPLOY_SERVER = 'your-server-ip'
    DEPLOY_USER = 'your-username'
}
```

Or use Jenkins environment variables:
- Go to **Manage Jenkins** → **Configure System**
- Under **Global properties**, check **Environment variables**
- Add your variables

---

## 🖥️ Deployment to Server

### Method 1: Automated Deployment (via Jenkins)

The Jenkinsfile handles automatic deployment when code is pushed to the `main` branch.

**Workflow**:
1. Developer pushes code to Git repository
2. Jenkins webhook triggers the pipeline
3. Pipeline runs tests
4. Builds Docker images
5. Pushes images to Docker Hub
6. Deploys to your server laptop
7. Performs health checks

### Method 2: Manual Deployment

#### On Your Server Laptop:

1. **Clone the repository**:
```bash
sudo mkdir -p /opt/my-academia
cd /opt/my-academia
git clone <your-repo-url> .
```

2. **Configure environment**:
```bash
cp .env.example .env
nano .env
```

3. **Deploy with Docker Compose**:
```bash
docker compose pull
docker compose up -d
```

4. **Check status**:
```bash
docker compose ps
docker compose logs -f
```

### Method 3: Deploy from Docker Hub

1. **Pull images**:
```bash
docker pull your-username/my-academia-backend:latest
docker pull your-username/my-academia-frontend:latest
```

2. **Run with docker-compose**:
```bash
docker compose up -d
```

---

## 🔍 Monitoring and Maintenance

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

### Check Container Health
```bash
# List running containers
docker compose ps

# Check health status
docker inspect --format='{{.State.Health.Status}}' my-academia-backend
```

### Access Database
```bash
# Connect to MongoDB
docker compose exec mongodb mongosh my-academia

# Backup database
docker compose exec mongodb mongodump --out=/data/backup

# Restore database
docker compose exec mongodb mongorestore /data/backup
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Or just restart without rebuilding
docker compose restart
```

---

## 🔒 Security Best Practices

1. **Change default secrets**:
   - Update `JWT_SECRET` in `.env`
   - Use strong passwords

2. **Use environment variables**:
   - Never commit `.env` files
   - Use `.env.example` as template

3. **Enable firewall**:
```bash
# Ubuntu/Debian
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 8080/tcp  # Jenkins (restrict to your IP)
sudo ufw enable
```

4. **Use HTTPS in production**:
   - Set up SSL certificates (Let's Encrypt)
   - Use reverse proxy (Nginx)

5. **Regular updates**:
```bash
# Update Docker images
docker compose pull
docker compose up -d

# Update base images
docker build --no-cache -t my-academia-backend:latest ./backend
```

---

## 🐛 Troubleshooting

### Issue: Containers won't start

**Solution**:
```bash
# Check logs
docker compose logs

# Check if ports are in use
netstat -tulpn | grep :5001
netstat -tulpn | grep :3000

# Remove old containers
docker compose down -v
docker compose up -d
```

### Issue: MongoDB connection failed

**Solution**:
```bash
# Check MongoDB is running
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Verify connection string in .env
echo $MONGODB_URI
```

### Issue: Frontend can't connect to backend

**Solution**:
1. Check `REACT_APP_API_URL` in `.env`
2. Verify backend is running: `curl http://localhost:5001/api/health`
3. Check CORS settings in backend
4. Rebuild frontend with correct API URL

### Issue: Jenkins can't connect to Docker

**Solution**:
```bash
# Add Jenkins to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# Verify docker access
sudo -u jenkins docker ps
```

### Issue: Out of disk space

**Solution**:
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused containers
docker container prune

# Full cleanup (careful!)
docker system prune -a --volumes
```

---

## 📊 Useful Commands

### Docker Compose
```bash
# Build without cache
docker compose build --no-cache

# Scale a service
docker compose up -d --scale backend=3

# View resource usage
docker stats

# Execute command in container
docker compose exec backend npm run test
```

### Docker
```bash
# List all containers
docker ps -a

# Remove all stopped containers
docker container prune

# View image layers
docker history my-academia-backend:latest

# Export container
docker export my-academia-backend > backend.tar

# Import image
docker import backend.tar my-academia-backend:imported
```

---

## 🎯 Next Steps

1. **Set up monitoring**:
   - Prometheus + Grafana for metrics
   - ELK Stack for log aggregation

2. **Implement CI/CD webhooks**:
   - Configure Git webhooks to trigger Jenkins builds

3. **Add automated backups**:
   - Schedule MongoDB backups
   - Store backups offsite

4. **Set up reverse proxy**:
   - Use Nginx or Traefik for SSL/TLS
   - Configure domain names

5. **Implement container orchestration**:
   - Consider Kubernetes for scaling
   - Use Docker Swarm for simpler orchestration

---

## 📞 Support

For issues or questions:
1. Check the logs: `docker compose logs -f`
2. Review this guide
3. Check Docker documentation: https://docs.docker.com/
4. Check Jenkins documentation: https://www.jenkins.io/doc/

---

## 📝 Notes

- Default ports:
  - Frontend: 3000 (mapped to 80 in container)
   - Backend: 5001
  - MongoDB: 27017
  - Jenkins: 8080

- Data persistence:
  - MongoDB data is persisted in Docker volume `mongodb_data`
  - Application code is not persisted (rebuild images for updates)

- Network:
  - All services communicate via `my-academia-network`
  - Services can reach each other by container name

---

**Happy Deploying! 🚀**
