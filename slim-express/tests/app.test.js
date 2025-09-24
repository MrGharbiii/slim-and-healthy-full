const request = require('supertest');
const app = require('../src/app');

describe('Express App', () => {
  test('GET / should return welcome message', async () => {
    const response = await request(app).get('/').expect(200);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Welcome to Slim Backend API');
  });

  test('GET /api/health should return health status', async () => {
    const response = await request(app).get('/api/health').expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  test('GET /api/users should return users array', async () => {
    const response = await request(app).get('/api/users').expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('POST /api/users should create new user', async () => {
    const newUser = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(201);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('name', newUser.name);
    expect(response.body.data).toHaveProperty('email', newUser.email);
  });

  test('GET /nonexistent should return 404', async () => {
    const response = await request(app).get('/nonexistent').expect(404);

    expect(response.body).toHaveProperty('error', 'Route not found');
  });
});
