# Jenkins Pipeline Setup & Configuration Guide

This guide walks you through setting up and running the **My Academia** declarative CI/CD pipeline in Jenkins.

---

## 🚀 Step 1: Start Jenkins

Run the automated startup script:

- **On Windows (PowerShell):**
  ```powershell
  .\scripts\start-jenkins.ps1
  ```
- **On Linux/macOS:**
  ```bash
  chmod +x scripts/start-jenkins.sh
  ./scripts/start-jenkins.sh
  ```

---

## 🔑 Step 2: Unlock Jenkins & Initial Setup

1. Open your browser to **[http://localhost:8085](http://localhost:8085)**.
2. When prompted for the **Administrator Password**, copy the password printed by the startup script (or run `docker exec my_academia_jenkins cat /var/jenkins_home/secrets/initialAdminPassword`).
3. Click **"Install suggested plugins"** (this automatically installs the Pipeline, Git, and Workspace Cleanup plugins).
4. Create your Admin user account and complete the setup wizard.

---

## 📋 Step 3: Create the Pipeline in Jenkins UI

1. On the Jenkins Dashboard, click **"New Item"** on the left navigation menu.
2. Enter the item name: `my-academia-pipeline`.
3. Select **"Pipeline"** as the project type and click **OK**.

---

## ⚙️ Step 4: Configure the Pipeline to use `Jenkinsfile`

1. In the job configuration page, scroll down to the **Pipeline** section.
2. Change **Definition** from *"Pipeline script"* to **"Pipeline script from SCM"**.
3. Set **SCM**: Select **Git**.
4. Set **Repository URL**: 
   - Enter your GitHub repository URL (e.g., `https://github.com/your-username/my_academia.git`), or for local testing, enter the repository folder path.
5. Set **Branches to build**: `*/main` (or `*/master` / `*/dev`).
6. Set **Script Path**: `Jenkinsfile`.
7. Click **Save**.

---

## ▶️ Step 5: Run & Monitor the Pipeline

1. On the pipeline page, click **"Build Now"** in the left sidebar.
2. You will see the **Stage View** execute each stage in real time:
   - ✅ **Checkout**
   - ✅ **Code Quality & SonarQube**
   - ✅ **Security Vulnerability Audit**
   - ✅ **Build & Test Services** (Backend, AI Service, and Frontend running in parallel)
   - ✅ **Build Docker Images**
   - ✅ **Docker Compose Smoke Test**
3. Click on any stage in the Stage View to view the console logs and test results.
