const request = require('supertest');
const app = require('../../server');
const prisma = require('../../prismaClient');

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch (e) {}
});

beforeEach(async () => {
  try {
    await prisma.user.deleteMany({
      where: { registrationNumber: { in: ['EG/2020/1234', 'EG/2020/1235'] } }
    });
  } catch (e) {
    console.log("Database cleanup notice:", e.message);
  }
});

describe('Auth API Tests', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        registrationNumber: 'EG/2020/1234',
        firstName: 'John',
        lastName: 'Doe',
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
        firstName: 'John',
        lastName: 'Doe',
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
        firstName: 'John',
        lastName: 'Doe',
        password: 'Password123'
      });

    // Second registration with same number
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        registrationNumber: 'EG/2020/1234',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'Password456'
      });
    
    expect(response.status).toBe(400);
  });
});