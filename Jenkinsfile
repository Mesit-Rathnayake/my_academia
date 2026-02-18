pipeline {
    agent any
    
    environment {
        APP_NAME = 'my-academia'
        DOCKER_USERNAME = 'mesith-30'
        DEPLOY_SERVER = '192.168.1.105'
        DEPLOY_USER = 'mesith'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '✓ Checking out code...'
                checkout scm
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo '✓ Building Docker images...'
                sh '''
                    docker build -t ${DOCKER_USERNAME}/${APP_NAME}-backend:latest ./backend
                    docker build -t ${DOCKER_USERNAME}/${APP_NAME}-frontend:latest ./frontend
                '''
            }
        }
        
        stage('Deploy to Server') {
            when {
                branch 'main'
            }
            steps {
                echo '✓ Deploying to server...'
                sh '''
                    # Pull latest code
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_SERVER} \
                    'cd /opt/${APP_NAME} && git pull origin main'
                    
                    # Stop and restart containers
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_SERVER} \
                    'cd /opt/${APP_NAME} && docker compose down && docker compose up -d'
                    
                    # Wait for services to start
                    sleep 10
                '''
            }
        }
        
        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                echo '✓ Checking service health...'
                sh '''
                    curl -f http://${DEPLOY_SERVER}:5001/api/health && echo "✓ Backend is healthy"
                    curl -f http://${DEPLOY_SERVER}:3000 && echo "✓ Frontend is healthy"
                '''
            }
        }
    }
    
    post {
        success {
            echo '✓ Pipeline succeeded!'
        }
        failure {
            echo '✗ Pipeline failed!'
        }
    }
}
