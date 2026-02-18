#!/bin/bash

# Jenkins Setup Helper Script for My Academia Project
# This script helps install and configure Jenkins on Ubuntu/Debian

set -e

echo "========================================"
echo "My Academia - Jenkins Setup Helper"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

echo "What would you like to do?"
echo "1) Install Jenkins"
echo "2) Install Jenkins plugins"
echo "3) Configure Jenkins for Docker"
echo "4) Configure SSH for deployment"
echo "5) Complete setup (all of the above)"
echo ""
read -p "Enter your choice (1-5): " choice

install_java() {
    echo -e "${BLUE}Installing Java...${NC}"
    apt update
    apt install -y openjdk-11-jdk
    java -version
    echo -e "${GREEN}✓ Java installed${NC}"
}

install_jenkins() {
    echo -e "${BLUE}Installing Jenkins...${NC}"
    
    # Install Java first
    install_java
    
    # Add Jenkins repository
    curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | tee \
        /usr/share/keyrings/jenkins-keyring.asc > /dev/null
    
    echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
        https://pkg.jenkins.io/debian-stable binary/ | tee \
        /etc/apt/sources.list.d/jenkins.list > /dev/null
    
    # Install Jenkins
    apt update
    apt install -y jenkins
    
    # Start Jenkins
    systemctl start jenkins
    systemctl enable jenkins
    
    echo ""
    echo -e "${GREEN}✓ Jenkins installed and started${NC}"
    echo ""
    echo "Initial Admin Password:"
    echo -e "${YELLOW}$(cat /var/lib/jenkins/secrets/initialAdminPassword)${NC}"
    echo ""
    echo "Access Jenkins at: http://$(hostname -I | awk '{print $1}'):8080"
    echo ""
    read -p "Press Enter after you've accessed Jenkins and installed suggested plugins..."
}

configure_docker() {
    echo -e "${BLUE}Configuring Docker for Jenkins...${NC}"
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        rm get-docker.sh
    fi
    
    # Add Jenkins user to docker group
    usermod -aG docker jenkins
    
    # Restart Jenkins
    systemctl restart jenkins
    
    echo -e "${GREEN}✓ Docker configured for Jenkins${NC}"
    echo "Jenkins can now run Docker commands"
}

install_plugins() {
    echo -e "${BLUE}Installing Jenkins plugins...${NC}"
    
    # Wait for Jenkins to be ready
    echo "Waiting for Jenkins to be ready..."
    sleep 30
    
    # Install Jenkins CLI
    wget http://localhost:8080/jnlpJars/jenkins-cli.jar -O /tmp/jenkins-cli.jar
    
    # Get admin password
    ADMIN_PASSWORD=$(cat /var/lib/jenkins/secrets/initialAdminPassword)
    
    # Install plugins
    PLUGINS=(
        "docker-plugin"
        "docker-workflow"
        "git"
        "ssh-agent"
        "email-ext"
        "workflow-aggregator"
    )
    
    for plugin in "${PLUGINS[@]}"; do
        echo "Installing $plugin..."
        java -jar /tmp/jenkins-cli.jar -s http://localhost:8080/ -auth admin:$ADMIN_PASSWORD install-plugin $plugin || true
    done
    
    # Restart Jenkins
    echo "Restarting Jenkins..."
    java -jar /tmp/jenkins-cli.jar -s http://localhost:8080/ -auth admin:$ADMIN_PASSWORD safe-restart
    
    echo -e "${GREEN}✓ Plugins installed${NC}"
    rm /tmp/jenkins-cli.jar
}

configure_ssh() {
    echo -e "${BLUE}Configuring SSH for deployment...${NC}"
    
    # Generate SSH key for Jenkins
    if [ ! -f /var/lib/jenkins/.ssh/id_rsa ]; then
        sudo -u jenkins ssh-keygen -t rsa -b 4096 -N "" -f /var/lib/jenkins/.ssh/id_rsa
        echo -e "${GREEN}✓ SSH key generated${NC}"
    else
        echo "SSH key already exists"
    fi
    
    echo ""
    echo "Jenkins SSH Public Key:"
    echo -e "${YELLOW}$(cat /var/lib/jenkins/.ssh/id_rsa.pub)${NC}"
    echo ""
    echo "Add this key to your deployment server's ~/.ssh/authorized_keys"
    echo ""
    read -p "Press Enter after adding the key to your server..."
    
    echo -e "${GREEN}✓ SSH configured${NC}"
}

open_firewall() {
    echo -e "${BLUE}Configuring firewall...${NC}"
    
    # Check if ufw is installed
    if command -v ufw &> /dev/null; then
        ufw allow 8080/tcp
        echo -e "${GREEN}✓ Firewall configured (port 8080 opened)${NC}"
    else
        echo -e "${YELLOW}UFW not found. Please manually open port 8080${NC}"
    fi
}

case $choice in
    1)
        install_jenkins
        open_firewall
        ;;
    2)
        install_plugins
        ;;
    3)
        configure_docker
        ;;
    4)
        configure_ssh
        ;;
    5)
        echo -e "${BLUE}Running complete setup...${NC}"
        install_jenkins
        open_firewall
        configure_docker
        configure_ssh
        # install_plugins  # Commented out as it requires manual Jenkins setup first
        
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}Jenkins Setup Complete!${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Access Jenkins at: http://$(hostname -I | awk '{print $1}'):8080"
        echo "2. Login with initial admin password shown above"
        echo "3. Install suggested plugins"
        echo "4. Create admin user"
        echo "5. Configure credentials in Jenkins:"
        echo "   - Add Docker Hub credentials (ID: dockerhub-credentials)"
        echo "   - Add SSH credentials for deployment (ID: deploy-ssh-key)"
        echo "6. Create a new Pipeline job using the Jenkinsfile from your repository"
        echo ""
        echo "See DEPLOYMENT_GUIDE.md for detailed instructions"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Done!${NC}"
