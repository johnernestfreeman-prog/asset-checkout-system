import request from 'supertest';
import app from '../app';
import pool from '../config/db';
import bcrypt from 'bcrypt';

describe('Asset routes with RBAC', () => {
  const userEmail = `rbac_user_${Date.now()}@example.com`;
  const adminEmail = `rbac_admin_${Date.now()}@example.com`;
  const password = 'testpass123';

  let userToken: string;
  let adminToken: string;
  let createdAssetId: number;

  beforeAll(async () => {
    // Register a normal user through the real API
    await request(app).post('/auth/register').send({ email: userEmail, password });
    const userLogin = await request(app).post('/auth/login').send({ email: userEmail, password });
    userToken = userLogin.body.token;

    // Create an admin directly via SQL (mirrors how you'd promote a real user)
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')`,
      [adminEmail, hash]
    );
    const adminLogin = await request(app).post('/auth/login').send({ email: adminEmail, password });
    adminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email IN ($1, $2)', [userEmail, adminEmail]);
    await pool.query('DELETE FROM assets WHERE name = $1', ['Jest Test Laptop']);
    await pool.end();
  });

  it('blocks unauthenticated requests with 401', async () => {
    const res = await request(app).get('/assets');
    expect(res.status).toBe(401);
  });

  it('blocks a regular user from creating an asset with 403', async () => {
    const res = await request(app)
      .post('/assets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Jest Test Laptop', category: 'IT Equipment' });

    expect(res.status).toBe(403);
  });

  it('allows an admin to create an asset', async () => {
    const res = await request(app)
      .post('/assets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Jest Test Laptop', category: 'IT Equipment', serial_number: `SN-${Date.now()}` });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('available');
    createdAssetId = res.body.id;
  });

  it('allows a regular user to check out an available asset', async () => {
    const res = await request(app)
      .post(`/assets/${createdAssetId}/checkout`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ due_date: '2026-12-31' });

    expect(res.status).toBe(201);
  });

  it('rejects checking out an asset that is already checked out', async () => {
    const res = await request(app)
      .post(`/assets/${createdAssetId}/checkout`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    expect(res.status).toBe(409);
  });

  it('allows checking the asset back in', async () => {
    const res = await request(app)
      .post(`/assets/${createdAssetId}/checkin`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.checked_in_at).not.toBeNull();
  });
});