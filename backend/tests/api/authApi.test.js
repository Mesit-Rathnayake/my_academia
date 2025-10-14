const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth API Tests', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        registrationNumber: 'EG/2020/1234',
        fullName: 'John Doe',
        password: 'Password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should login with valid credentials', async () => {
    // First register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        registrationNumber: 'EG/2020/1234',
        fullName: 'John Doe',
        password: 'Password123'
      });

    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        registrationNumber: 'EG/2020/1234',
        password: 'Password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should reject login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        registrationNumber: 'EG/2020/1234',
        password: 'wrongpassword'
      });
    
    expect(response.status).toBe(400);
  });

  it('should reject registration with duplicate registration number', async () => {
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send({
        registrationNumber: 'EG/2020/1234',
        fullName: 'John Doe',
        password: 'password123'
      });

    // Second registration with same number
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        registrationNumber: 'EG/2020/1234',
        fullName: 'Jane Smith',
        password: 'password456'
      });
    
    expect(response.status).toBe(400);
  });
});