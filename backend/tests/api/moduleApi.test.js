const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../../models/User');
const Module = require('../../models/Module');
const jwt = require('jsonwebtoken');

let mongoServer;
let authToken;
let testUser;

beforeAll(async () => {
  // Setup in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Create test user
  testUser = new User({
    registrationNumber: 'EG/2020/1234',
    fullName: 'API Test User',
    password: 'password123'
  });
  await testUser.save();
  
  // Generate token
  authToken = jwt.sign(
    { _id: testUser._id }, 
    process.env.JWT_SECRET, 
    { 
      algorithm: 'HS256',
      issuer: 'my-academia',
      audience: 'my-academia-users'
    }
  );
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Module.deleteMany({});
});

describe('Module API Tests', () => {
  it('should create a new module via API', async () => {
    const response = await request(app)
      .post('/api/modules')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        moduleName: 'Database Systems',
        moduleCode: 'CS2040',
        lectureHours: 30,
        attendedHours: 0
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('moduleName', 'Database Systems');
    expect(response.body).toHaveProperty('moduleCode', 'CS2040');
  });

  it('should retrieve all modules via API', async () => {
    // First create a module
    await Module.create({
      moduleName: 'Web Development',
      moduleCode: 'CS2050',
      lectureHours: 30,
      attendedHours: 0,
      user: testUser._id
    });

    const response = await request(app)
      .get('/api/modules')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0]).toHaveProperty('moduleName', 'Web Development');
  });

  it('should return 401 unauthorized without token', async () => {
    const response = await request(app)
      .get('/api/modules');
    
    expect(response.status).toBe(401);
  });

  it('should return 400 for duplicate module code', async () => {
    // Create first module
    await request(app)
      .post('/api/modules')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        moduleName: 'Database Systems',
        moduleCode: 'CS2040',
        lectureHours: 30
      });

    // Try to create duplicate
    const response = await request(app)
      .post('/api/modules')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        moduleName: 'Another Database Course',
        moduleCode: 'CS2040', // Same code
        lectureHours: 30
      });
    
    expect(response.status).toBe(400);
  });
});