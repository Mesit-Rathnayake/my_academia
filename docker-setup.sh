#!/bin/bash

# My Academia - Docker Setup Script
# This script helps you quickly set up the application

set -e

echo "=================================="
echo "My Academia - Docker Setup"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed${NC}"
echo -e "${GREEN}✓ Docker Compose is installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}! .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}⚠ Please edit .env file and set your configuration${NC}"
    echo "  - JWT_SECRET: Set a strong secret key"
    echo "  - REACT_APP_API_URL: Set your backend URL"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
fi

echo "What would you like to do?"
echo "1) Build and start all services"
echo "2) Start services (without rebuilding)"
echo "3) Stop all services"
echo "4) View logs"
echo "5) Clean up (remove containers and volumes)"
echo "6) Check service status"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "Building and starting services..."
        docker compose up -d --build
        echo ""
        echo -e "${GREEN}✓ Services started successfully!${NC}"
        echo ""
        echo "Access the application at:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:5000"
        echo "  MongoDB:  localhost:27017"
        echo ""
        echo "To view logs, run: docker compose logs -f"
        ;;
    2)
        echo ""
        echo "Starting services..."
        docker compose up -d
        echo ""
        echo -e "${GREEN}✓ Services started successfully!${NC}"
        ;;
    3)
        echo ""
        echo "Stopping services..."
        docker compose down
        echo ""
        echo -e "${GREEN}✓ Services stopped${NC}"
        ;;
    4)
        echo ""
        echo "Showing logs (Ctrl+C to exit)..."
        docker compose logs -f
        ;;
    5)
        echo ""
        echo -e "${RED}WARNING: This will remove all containers, networks, and volumes${NC}"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" == "yes" ]; then
            docker compose down -v
            echo ""
            echo -e "${GREEN}✓ Cleanup completed${NC}"
        else
            echo "Cleanup cancelled"
        fi
        ;;
    6)
        echo ""
        echo "Service Status:"
        docker compose ps
        echo ""
        echo "Container Health:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
