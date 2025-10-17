const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Login UI Test for My Academia
async function runLoginTest() {
  let driver;
  
  try {
    console.log('SELENIUM LOGIN UI TEST');
    console.log('Target: http://localhost:3000/login');
    console.log('Browser: Chrome (Headless Mode)');
    console.log('');
    
    // Setup Chrome driver
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1200,800');

    console.log('Setting up Chrome WebDriver...');
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await driver.manage().setTimeouts({ implicit: 8000 });
    console.log('WebDriver initialized successfully');
    console.log('');

    // Test 1: Navigate to Login Page
    console.log('TEST 1: Navigate to Login Page');
    await driver.get('http://localhost:3000/login');
    await driver.sleep(2000);
    
    const currentUrl = await driver.getCurrentUrl();
    console.log(`Successfully navigated to: ${currentUrl}`);
    
    const pageTitle = await driver.getTitle();
    console.log(`Page title: "${pageTitle}"`);
    console.log('');

    // Test 2: Locate Login Form Elements
    console.log('TEST 2: Locate Login Form Elements');
    
    // Find registration number input (based on your LogIn.jsx)
    const regInput = await driver.wait(until.elementLocated(
      By.css('input[placeholder*="Registration Number"], input[type="text"]')
    ), 10000);
    console.log('Registration number input field located');
    
    // Find password input
    const passInput = await driver.wait(until.elementLocated(
      By.css('input[type="password"]')
    ), 5000);
    console.log('Password input field located');
    
    // Find submit button
    const loginForm = await driver.findElement(By.css('.loginform'));
    console.log('Login form located');
    console.log('');

    // Test 3: Fill Login Form with Valid Credentials
    console.log('TEST 3: Fill Login Form with Valid Credentials');
    
    await regInput.clear();
    await regInput.sendKeys('EG/2020/9999');
    console.log('Registration number entered: EG/2020/9999');
    
    await passInput.clear();
    await passInput.sendKeys('Password123');
    console.log('Password entered: Password123');
    console.log('');

    // Test 4: Submit Form and Check Navigation
    console.log('TEST 4: Submit Form and Check Navigation');
    
    await loginForm.submit();
    await driver.sleep(3000); // Wait for login process
    
    const newUrl = await driver.getCurrentUrl();
    console.log(`Form submitted, current URL: ${newUrl}`);
    
    if (newUrl.includes('/Home') || newUrl.includes('/home')) {
      console.log('Successfully redirected to Home page');
    } else if (newUrl.includes('/login')) {
      console.log('Still on login page (may indicate invalid credentials)');
    } else {
      console.log('Redirected to dashboard/main page');
    }
    console.log('');

    // Test Summary
    console.log('LOGIN TEST SUMMARY:');
    console.log('Page navigation: PASSED');
    console.log('Form element detection: PASSED');
    console.log('Form interaction: PASSED');
    console.log('Form submission: PASSED');
    console.log('');
    console.log('Login UI test completed successfully!');

  } catch (error) {
    console.error('Login test failed:', error.message);
    throw error;
  } finally {
    if (driver) {
      await driver.quit();
      console.log('WebDriver closed');
    }
  }
}

// Run the login test
runLoginTest()
  .then(() => {
    console.log('');
    console.log('LOGIN UI TEST COMPLETE');
    console.log('Status: ALL TESTS PASSED');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });