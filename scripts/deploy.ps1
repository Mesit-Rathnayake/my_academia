# ==============================================================================
# My Academia - Production Deployment Automation Script (PowerShell)
# ==============================================================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "[*] Starting My Academia Automated Deployment" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Check prerequisite environment file
if (-not (Test-Path ".env")) {
    Write-Host "[!] .env file not found! Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[!] Please update your secrets and GEMINI_API_KEY in .env before running in production." -ForegroundColor Yellow
}

# 2. Build Docker container images
Write-Host ""
Write-Host "[*] Building Docker container images..." -ForegroundColor Magenta
docker compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[x] Docker build failed!" -ForegroundColor Red
    exit 1
}

# 3. Start PostgreSQL and AI service first
Write-Host ""
Write-Host "[*] Starting database and supporting services..." -ForegroundColor Magenta
docker compose up -d postgres ai-service

# 4. Wait for PostgreSQL to become healthy
Write-Host "[*] Waiting for PostgreSQL database readiness..." -ForegroundColor Yellow
$maxRetries = 15
$retryCount = 0
$dbReady = $false

while (-not $dbReady -and $retryCount -lt $maxRetries) {
    Start-Sleep -Seconds 2
    $retryCount++
    docker compose exec -T postgres pg_isready -U postgres -d my_academia *>$null
    if ($LASTEXITCODE -eq 0) {
        $dbReady = $true
    } else {
        Write-Host "Waiting for database connection... ($retryCount/$maxRetries)" -ForegroundColor Gray
    }
}

if (-not $dbReady) {
    Write-Host "[x] Database connection timed out!" -ForegroundColor Red
    exit 1
}
Write-Host "[+] Database is ready." -ForegroundColor Green

# 5. Run Prisma Database Sync / Migrations
Write-Host ""
Write-Host "[*] Running Prisma database sync in backend..." -ForegroundColor Magenta
docker compose run --rm backend npx prisma db push --skip-generate

# 6. Launch full microservices stack
Write-Host ""
Write-Host "[*] Launching full microservices stack..." -ForegroundColor Magenta
docker compose up -d --remove-orphans

# 7. Verification & Health Probing
Write-Host ""
Write-Host "[*] Performing health check probes..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

if (Get-Command node -ErrorAction SilentlyContinue) {
    node scripts/healthcheck.js
} else {
    try {
        $resApi = Invoke-RestMethod -Uri "http://localhost:8080/ma-api/v1/health" -Method Get
        $resAi = Invoke-RestMethod -Uri "http://localhost:8080/ma-ai/v1/health" -Method Get
        Write-Host "[+] Backend and AI services are healthy via Gateway!" -ForegroundColor Green
    } catch {
        Write-Host "[x] Health check failed: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "[+] Deployment completed successfully!" -ForegroundColor Green
Write-Host "[+] Access application via API Gateway: http://localhost:8080" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan
