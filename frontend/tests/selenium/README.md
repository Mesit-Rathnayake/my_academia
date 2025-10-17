# Selenium UI Tests - My Academia

## Overview
Simple Selenium WebDriver demonstration for automated UI testing of the My Academia React frontend application.

## Demo Test (`demo-test.js`)
**Test Scenarios:**
- ✅ **Login Page Navigation:** Navigate to login page and verify elements
- ✅ **Form Element Detection:** Locate registration and password input fields
- ✅ **Form Interaction Simulation:** Enter test credentials into form
- ✅ **Dashboard Navigation:** Navigate to main application dashboard

## Prerequisites

### Install Dependencies
```bash
npm install --save-dev selenium-webdriver chromedriver
```

### Start Applications
```bash
# Terminal 1: Start React app
cd frontend
npm start

# Terminal 2: Start Node.js backend  
cd backend
npm start
```

## Running Demo

### Run Selenium Demo
```bash
cd frontend
node tests/selenium/demo-test.js
```

## Demo Features
- **Automated Browser Control:** Chrome WebDriver automation
- **Page Navigation:** Automated navigation to login and dashboard pages
- **Form Interaction:** Simulated user input in registration and password fields
- **Element Detection:** Locates and verifies UI elements
- **Test Reporting:** Clear pass/fail status with detailed logging

## File Structure
```
frontend/tests/selenium/
├── demo-test.js       # Selenium UI test demonstration
├── README.md          # This documentation
└── screenshots/       # Generated screenshots (if any)
```

## Demo Output
When you run the demo, you'll see:
- WebDriver initialization
- Test step execution with clear status indicators
- Pass/fail results for each test scenario
- Summary of all test results

Perfect for demonstrating automated UI testing capabilities!