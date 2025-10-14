const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;
let testUserId;

beforeAll(async () => {
  // Set up in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Create a test user and get token
  const user = new User({
    registrationNumber: 'EG/2020/1234',
    fullName: 'Test User',
    password: 'password123'
  });
  await user.save();
  
  testUserId = user._id;
  token = jwt.sign(
    { _id: user._id }, 
    process.env.JWT_SECRET, 
    { 
      algorithm: 'HS256',
      issuer: 'my-academia',
      audience: 'my-academia-users'
    }
  );
}, 30000); // Increase timeout to 30 seconds for setup

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Module Creation - TDD', () => {
  it('should create a new module with valid data', async () => {
    const response = await request(app)
      .post('/api/modules')
      .set('Authorization', `Bearer ${token}`)
      .send({
        moduleName: 'Database Systems',
        moduleCode: 'CS2040',
        lectureHours: 30,
        attendedHours: 0
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('moduleName', 'Database Systems');
    expect(response.body).toHaveProperty('moduleCode', 'CS2040');
  }, 10000); // 10 second timeout for this test

  it('should reject module creation without authentication', async () => {
    const response = await request(app)
      .post('/api/modules')
      .send({
        moduleName: 'Database Systems',
        moduleCode: 'CS2040',
        lectureHours: 30
      });

    expect(response.status).toBe(401);
  });

  it('should reject module creation with missing required fields', async () => {
    const response = await request(app)
      .post('/api/modules')
      .set('Authorization', `Bearer ${token}`)
      .send({
        moduleCode: 'CS2040',
        lectureHours: 30
        // missing moduleName
      });

    expect(response.status).toBe(400);
  });
});