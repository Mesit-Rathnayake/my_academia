const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');  // Changed from '../../src/server'

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('User Registration - TDD', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        registrationNumber: 'EG/2020/1234',
        fullName: 'John Doe',
        password: 'password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should reject duplicate registration numbers', async () => {
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
    expect(response.body).toHaveProperty('message', 'Registration number already exists');
  });
});