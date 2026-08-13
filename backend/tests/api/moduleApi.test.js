const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

let authToken;
let testUser;

beforeAll(async () => {
  try {
    // Clean up if exists
    await prisma.user.deleteMany({ where: { registrationNumber: 'EG/2020/1234' } });
    
    // Create test user
    testUser = await prisma.user.create({
      data: {
        registrationNumber: 'EG/2020/1234',
        fullName: 'API Test User',
        password: 'password123'
      }
    });
    
    // Generate token
    authToken = jwt.sign(
      { _id: testUser.id }, 
      process.env.JWT_SECRET, 
      { 
        algorithm: 'HS256',
        issuer: 'my-academia',
        audience: 'my-academia-users'
      }
    );
  } catch (e) {
    console.log("Ensure PostgreSQL is running for tests to pass");
  }
}, 30000);

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch(e) {}
});

beforeEach(async () => {
  try {
    await prisma.module.deleteMany({});
  } catch(e) {}
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
    await prisma.module.create({
      data: {
        moduleName: 'Web Development',
        moduleCode: 'CS2050',
        lectureHours: 30,
        attendedHours: 0,
        userId: testUser.id
      }
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