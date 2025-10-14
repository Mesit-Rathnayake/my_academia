const { Given, When, Then } = require('@cucumber/cucumber');

let testResult;

Given('I have a Cucumber testing framework', function () {
    // Setup Cucumber testing framework
    this.framework = 'Cucumber';
});

When('I run the test', function () {
    // Simulate running a test that returns "Hello World"
    testResult = 'Hello World';
});

Then('I should see {string} message', function (expectedMessage) {
    // Verify the message
    if (testResult !== expectedMessage) {
        throw new Error(`Expected "${expectedMessage}" but got "${testResult}"`);
    }
});