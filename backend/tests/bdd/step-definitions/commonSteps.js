const { 
  Given, 
  When, 
  Then, 
  Before, 
  After, 
  BeforeAll, 
  AfterAll 
} = require('@cucumber/cucumber');
const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../../server');
const User = require('../../../models/User');
const Module = require('../../../models/Module');
const jwt = require('jsonwebtoken');

let mongoServer;
let response;
let authToken;
let testUser;

// -----------------------------
// Hooks
// -----------------------------



// Clean up before each scenario
Before({ timeout: 20000 }, async function () {
  await User.deleteMany({});
  await Module.deleteMany({});
  
  // Create test user for each scenario
  testUser = new User({
    registrationNumber: 'EG/2020/1234',
    fullName: 'Test Student',
    password: 'password123'
  });
  await testUser.save();
  
  // Generate token
  authToken = jwt.sign({ _id: testUser._id }, process.env.JWT_SECRET);
});


// Optional: clear state after each scenario
After(async function () {
  response = null;
});

// -----------------------------
// Step Definitions
// -----------------------------

Given('I am logged in as a student', async function () {
  // Already handled in Before hook
});

Given('I have a module with code {string}', async function (moduleCode) {
  const module = new Module({
    moduleName: 'Test Module',
    moduleCode: moduleCode,
    lectureHours: 30,
    user: testUser._id
  });
  await module.save();
});

Given('I have created multiple modules', async function () {
  const modules = [
    { moduleName: 'Database Systems', moduleCode: 'CS2040', user: testUser._id, lectureHours: 30 },
    { moduleName: 'Web Development', moduleCode: 'CS2050', user: testUser._id, lectureHours: 30 }
  ];
  await Module.insertMany(modules);
});

When('I create a module with name {string} and code {string}', async function (moduleName, moduleCode) {
  response = await request(app)
    .post('/api/modules')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      moduleName: moduleName,
      moduleCode: moduleCode,
      lectureHours: 30,
      attendedHours: 0
    });
});

When('I try to create another module with code {string}', async function (moduleCode) {
  response = await request(app)
    .post('/api/modules')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      moduleName: 'Duplicate Module',
      moduleCode: moduleCode,
      lectureHours: 30,
      attendedHours: 0
    });
});

When('I request my modules list', async function () {
  response = await request(app)
    .get('/api/modules')
    .set('Authorization', `Bearer ${authToken}`);
});

Then('the module should be created successfully', function () {
  expect(response.status).to.equal(201);
  expect(response.body).to.have.property('moduleName');
});

Then('I should see {string} in my modules list', async function (moduleName) {
  // Fetch modules list
  const listResponse = await request(app)
    .get('/api/modules')
    .set('Authorization', `Bearer ${authToken}`);

  expect(listResponse.status).to.equal(200);
  expect(listResponse.body).to.be.an('array');

  const hasModule = listResponse.body.some(module => module.moduleName === moduleName);
  expect(hasModule).to.be.true;
});


Then('I should get a duplicate module error', function () {
  // Could be 400 or 401 depending on your validation
  expect([400, 401]).to.include(response.status);
  expect(response.body).to.have.property('message');
});

Then('I should see all my modules', function () {
  expect(response.status).to.equal(200);
  expect(response.body).to.be.an('array');
  expect(response.body.length).to.be.greaterThan(1);
});
