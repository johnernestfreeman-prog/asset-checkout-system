import pool from '../config/db';

export interface Asset {
  id: number;
  name: string;
  category: string | null;
  serial_number: string | null;
  status: 'available' | 'checked_out' | 'maintenance';
  created_at: Date;
  updated_at: Date;
}

export const getAllAssets = async (): Promise<Asset[]> => {
  const result = await pool.query('SELECT * FROM assets ORDER BY created_at DESC');
  return result.rows;
};

export const getAssetById = async (id: number): Promise<Asset | null> => {
  const result = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createAsset = async (
  name: string,
  category: string | null,
  serialNumber: string | null
): Promise<Asset> => {
  const result = await pool.query(
    'INSERT INTO assets (name, category, serial_number) VALUES ($1, $2, $3) RETURNING *',
    [name, category, serialNumber]
  );
  return result.rows[0];
};

export const updateAssetStatus = async (
  id: number,
  status: 'available' | 'checked_out' | 'maintenance'
): Promise<Asset | null> => {
  const result = await pool.query(
    'UPDATE assets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0] || null;
};


export interface Checkout {
  id: number;
  asset_id: number;
  user_id: number;
  checked_out_at: Date;
  due_date: string | null;
  checked_in_at: Date | null;
  notes: string | null;
}

export const createCheckout = async (
  assetId: number,
  userId: number,
  dueDate: string | null,
  notes: string | null
): Promise<Checkout> => {
  const result = await pool.query(
    `INSERT INTO checkouts (asset_id, user_id, due_date, notes)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [assetId, userId, dueDate, notes]
  );
  return result.rows[0];
};

export const getActiveCheckoutByAsset = async (assetId: number): Promise<Checkout | null> => {
  const result = await pool.query(
    `SELECT * FROM checkouts WHERE asset_id = $1 AND checked_in_at IS NULL
     ORDER BY checked_out_at DESC LIMIT 1`,
    [assetId]
  );
  return result.rows[0] || null;
};

export const checkInAsset = async (checkoutId: number): Promise<Checkout | null> => {
  const result = await pool.query(
    `UPDATE checkouts SET checked_in_at = NOW()
     WHERE id = $1 AND checked_in_at IS NULL RETURNING *`,
    [checkoutId]
  );
  return result.rows[0] || null;
};