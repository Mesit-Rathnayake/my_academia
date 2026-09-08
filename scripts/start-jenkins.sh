#!/usr/bin/env bash
# ==============================================================================
# My Academia - Start Local Jenkins Server (Bash)
# ==============================================================================
set -e

echo "=========================================="
echo "🚀 Launching Local Jenkins Server on Port 8085"
echo "=========================================="

docker compose -f docker-compose.jenkins.yml up -d

echo "⏳ Waiting 15s for Jenkins to initialize..."
sleep 15

PASSWORD=$(docker exec my_academia_jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null || true)

if [ -n "$PASSWORD" ]; then
    echo "========================================================"
    echo "👉 Jenkins URL: http://localhost:8085"
    echo "👉 Initial Admin Password: $PASSWORD"
    echo "========================================================"
else
    echo "Jenkins is starting up. To fetch the password once ready, run:"
    echo "docker exec my_academia_jenkins cat /var/jenkins_home/secrets/initialAdminPassword"
fi
