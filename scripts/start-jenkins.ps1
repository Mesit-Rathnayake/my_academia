# ==============================================================================
# My Academia - Start Local Jenkins Server (PowerShell)
# ==============================================================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "[*] Launching Local Jenkins Server on Port 8085" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Start Jenkins container
docker compose -f docker-compose.jenkins.yml up -d

Write-Host ""
Write-Host "[*] Waiting for Jenkins to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 2. Extract and display Initial Admin Password
Write-Host ""
Write-Host "[*] Retrieving Jenkins Initial Admin Password..." -ForegroundColor Cyan
$password = docker exec my_academia_jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>$null

if ($password) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "[+] Jenkins URL: http://localhost:8085" -ForegroundColor White
    Write-Host "[+] Initial Admin Password: $password" -ForegroundColor Yellow
    Write-Host "========================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Jenkins is still booting up. Run this command in a few seconds to get the password:" -ForegroundColor Yellow
    Write-Host "docker exec my_academia_jenkins cat /var/jenkins_home/secrets/initialAdminPassword" -ForegroundColor White
}
