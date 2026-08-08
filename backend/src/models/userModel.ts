import pool from '../config/db';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: Date;
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const createUser = async (
  email: string,
  passwordHash: string,
  role: 'user' | 'admin' = 'user'
): Promise<User> => {
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
    [email, passwordHash, role]
  );
  return result.rows[0];
};