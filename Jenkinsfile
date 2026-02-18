pipeline {
    agent any
    
    environment {
        // Docker Hub credentials (configure in Jenkins)
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        
        // Application configuration
        APP_NAME = 'my-academia'
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/${env.DOCKER_USERNAME}/${APP_NAME}-backend"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/${env.DOCKER_USERNAME}/${APP_NAME}-frontend"
        
        // Versioning
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        
        // Deployment server (configure as needed)
        DEPLOY_SERVER = 'your-server-ip-or-hostname'
        DEPLOY_USER = 'your-deploy-user'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
                script {
                    // Get commit info for build metadata
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            echo 'Installing backend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            echo 'Installing frontend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            echo 'Running backend tests...'
                            sh 'npm test -- --coverage --passWithNoTests'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            echo 'Running frontend tests...'
                            sh 'CI=true npm test -- --coverage --passWithNoTests'
                        }
                    }
                }
            }
        }
        
        stage('Code Quality Analysis') {
            when {
                environment name: 'SKIP_SONAR', value: 'false'
            }
            steps {
                script {
                    echo 'Running SonarQube analysis...'
                    // Uncomment and configure SonarQube scanner
                    // withSonarQubeEnv('SonarQube') {
                    //     sh 'sonar-scanner'
                    // }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        dir('backend') {
                            echo 'Building backend Docker image...'
                            script {
                                docker.build("${BACKEND_IMAGE}:${IMAGE_TAG}")
                                docker.build("${BACKEND_IMAGE}:latest")
                            }
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        dir('frontend') {
                            echo 'Building frontend Docker image...'
                            script {
                                docker.build("${FRONTEND_IMAGE}:${IMAGE_TAG}")
                                docker.build("${FRONTEND_IMAGE}:latest")
                            }
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            when {
                environment name: 'SKIP_SECURITY_SCAN', value: 'false'
            }
            steps {
                echo 'Scanning Docker images for vulnerabilities...'
                script {
                    // Using Trivy for security scanning
                    sh """
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest image --severity HIGH,CRITICAL \
                        ${BACKEND_IMAGE}:${IMAGE_TAG} || true
                        
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest image --severity HIGH,CRITICAL \
                        ${FRONTEND_IMAGE}:${IMAGE_TAG} || true
                    """
                }
            }
        }
        
        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                echo 'Pushing Docker images to registry...'
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", "${DOCKER_CREDENTIALS_ID}") {
                        // Push backend images
                        sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${BACKEND_IMAGE}:latest"
                        
                        // Push frontend images
                        sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${FRONTEND_IMAGE}:latest"
                    }
                }
            }
        }
        
        stage('Deploy to Server') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploying to server...'
                script {
                    // Copy docker-compose file to server
                    sh """
                        scp -o StrictHostKeyChecking=no \
                        docker-compose.yml \
                        ${DEPLOY_USER}@${DEPLOY_SERVER}:/opt/${APP_NAME}/
                        
                        scp -o StrictHostKeyChecking=no \
                        .env.example \
                        ${DEPLOY_USER}@${DEPLOY_SERVER}:/opt/${APP_NAME}/.env.example
                    """
                    
                    // Deploy using docker-compose
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_SERVER} \
                        'cd /opt/${APP_NAME} && \
                        docker-compose pull && \
                        docker-compose down && \
                        docker-compose up -d'
                    """
                }
            }
        }
        
        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                echo 'Performing health check...'
                script {
                    sh """
                        sleep 30
                        curl -f http://${DEPLOY_SERVER}:5000/api/health || exit 1
                        curl -f http://${DEPLOY_SERVER}:3000/health || exit 1
                    """
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up...'
            // Clean up workspace
            cleanWs()
            
            // Remove dangling images
            sh 'docker image prune -f || true'
        }
        success {
            echo 'Pipeline succeeded! 🎉'
            // Send success notification (configure as needed)
            // emailext (
            //     subject: "SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
            //     body: "The build succeeded. Check console output at ${env.BUILD_URL}",
            //     to: 'team@example.com'
            // )
        }
        failure {
            echo 'Pipeline failed! 😞'
            // Send failure notification (configure as needed)
            // emailext (
            //     subject: "FAILURE: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
            //     body: "The build failed. Check console output at ${env.BUILD_URL}",
            //     to: 'team@example.com'
            // )
        }
    }
}
