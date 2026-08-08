import request from 'supertest';
import app from '../app';
import pool from '../config/db';

describe('Auth routes', () => {
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'testpass123';

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    await pool.end();
  });

  it('registers a new user and returns 201', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe(testEmail);
    expect(res.body.role).toBe('user');
  });

  it('rejects duplicate registration with 409', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials and returns a JWT', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
  });

  it('rejects login with wrong password with 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });
});