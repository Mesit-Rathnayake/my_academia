const request = require('supertest');
const app = require('../../server');

describe('Module Route Security & Validation Tests', () => {
  it('should reject GET /api/modules without authentication token', async () => {
    const response = await request(app).get('/api/modules');
    expect(response.status).toBe(401);
  });

  it('should reject POST /api/modules with invalid token format', async () => {
    const response = await request(app)
      .post('/api/modules')
      .set('Authorization', 'Bearer invalid-jwt-token')
      .send({
        moduleName: 'Test Module',
        moduleCode: 'CS1000'
      });
    expect(response.status).toBe(401);
  });
});