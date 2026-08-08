import { register, login } from '../controllers/authController';
import * as UserModel from '../models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../models/userModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authController - coverage gaps', () => {
  afterEach(() => jest.clearAllMocks());

  // Lines 13-14
  it('register returns 400 when email or password missing', async () => {
    const req: any = { body: { email: '' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // Line 28
  it('register returns 500 on unexpected failure', async () => {
    (UserModel.findUserByEmail as jest.Mock).mockRejectedValue(new Error('db error'));
    const req: any = { body: { email: 'a@a.com', password: 'pass123' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // Lines 37-38
  it('login returns 400 when email or password missing', async () => {
    const req: any = { body: { email: '' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // Lines 43-44 (user not found)
  it('login returns 401 when user does not exist', async () => {
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue(null);
    const req: any = { body: { email: 'a@a.com', password: 'pass123' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  // Lines 43-44 (wrong password)
  it('login returns 401 when password does not match', async () => {
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue({
      id: 1, email: 'a@a.com', password_hash: 'hashed', role: 'user'
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const req: any = { body: { email: 'a@a.com', password: 'wrongpass' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  // Line 61
  it('login returns 500 on unexpected failure', async () => {
    (UserModel.findUserByEmail as jest.Mock).mockRejectedValue(new Error('db error'));
    const req: any = { body: { email: 'a@a.com', password: 'pass123' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});