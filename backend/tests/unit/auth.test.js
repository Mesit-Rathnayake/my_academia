const request = require('supertest');
const app = require('../../server');

describe('Server & Health Unit Tests', () => {
  it('should return health check status OK', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
  });

  it('should reject registration with invalid payload', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        registrationNumber: 'invalid-num', // Format mismatch
        password: '123' // Too short
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
  });

  it('should reject login without password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        registrationNumber: 'EG/2020/1234'
      });
    
    expect(response.status).toBe(400);
  });
});