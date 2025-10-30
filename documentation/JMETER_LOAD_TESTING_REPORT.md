# JMeter Load Testing Report

## Test Overview
Simulated concurrent users hitting the API endpoint
Collected metrics: response time, throughput, errors

## Target API Endpoints
- **POST /api/auth/register** – signup user authentication
- **POST /api/auth/login** – login user authentication

## Test Configuration
- **Base URL**: http://localhost:5000
- **Test User**: EG/2020/9999
- **Password**: Password123
- **Method**: POST requests with JSON payload

## Performance Results
- **Response Time**: Average ~200ms for authentication endpoints
- **Throughput**: Successfully handled concurrent user requests
- **Error Rate**: 0% errors after rate limiting adjustment

## Bottlenecks
None observed during testing - system performed within acceptable parameters