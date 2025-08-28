const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../../server');
const User = require('../../../models/User');
const Module = require('../../../models/Module');
const jwt = require('jsonwebtoken');

let response;
let authToken;
let testUser;

Given('I am logged in as a student', async function () {
  // Clean up any existing test data
  await User.deleteMany({});
  await Module.deleteMany({});
  
  // Create test user
  testUser = new User({
    registrationNumber: 'EG/2020/1234',
    fullName: 'Test Student',
    password: 'password123'
  });
  await testUser.save();
  
  // Generate token
  authToken = jwt.sign({ _id: testUser._id }, process.env.JWT_SECRET);
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
  expect(response.status).to.equal(200);
  expect(response.body).to.be.an('array');
  const hasModule = response.body.some(module => module.moduleName === moduleName);
  expect(hasModule).to.be.true;
});

Then('I should get a duplicate module error', function () {
  expect(response.status).to.equal(400);
  expect(response.body).to.have.property('message');
});

Then('I should see all my modules', function () {
  expect(response.status).to.equal(200);
  expect(response.body).to.be.an('array');
  expect(response.body.length).to.be.greaterThan(1);
});