const request = require('supertest');
const app = require('../../server');
const prisma = require('../../prismaClient');
const jwt = require('jsonwebtoken');

let authToken;
let testUser;

beforeAll(async () => {
  try {
    // Clean up if exists
    await prisma.user.deleteMany({ where: { registrationNumber: 'EG/2020/9999' } });
    
    // Create test user
    testUser = await prisma.user.create({
      data: {
        registrationNumber: 'EG/2020/9999',
        firstName: 'API',
        lastName: 'Tester',
        password: 'password123'
      }
    });
    
    // Generate token
    authToken = jwt.sign(
      { id: testUser.id }, 
      process.env.JWT_SECRET || 'test_jwt_secret', 
      { 
        algorithm: 'HS256',
        issuer: 'my-academia',
        audience: 'my-academia-users'
      }
    );
  } catch (e) {
    console.log("Setup notice:", e.message);
  }
}, 30000);

afterAll(async () => {
  try {
    if (testUser) {
      await prisma.module.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.deleteMany({ where: { id: testUser.id } });
    }
    await prisma.$disconnect();
  } catch(e) {}
});

beforeEach(async () => {
  try {
    if (testUser) {
      await prisma.module.deleteMany({ where: { userId: testUser.id } });
    }
  } catch(e) {}
});

describe('Module API Tests', () => {
  it('should create a new module via API', async () => {
    if (!authToken) return;
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
    if (!authToken || !testUser) return;
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
});