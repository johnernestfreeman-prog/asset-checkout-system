import { getAssets, createAsset, checkoutAsset, checkinAsset } from '../controllers/assetController';
import * as AssetModel from '../models/assetModel';

jest.mock('../models/assetModel');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('assetController - coverage gaps', () => {
  afterEach(() => jest.clearAllMocks());

  // Lines 5-9
  it('getAssets returns 200 with assets', async () => {
    (AssetModel.getAllAssets as jest.Mock).mockResolvedValue([{ id: 1 }]);
    const req: any = {};
    const res = mockRes();
    await getAssets(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getAssets returns 500 on failure', async () => {
    (AssetModel.getAllAssets as jest.Mock).mockRejectedValue(new Error('db down'));
    const req: any = {};
    const res = mockRes();
    await getAssets(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // Lines 18-19
  it('createAsset returns 400 when name is missing', async () => {
    const req: any = { body: {} };
    const res = mockRes();
    await createAsset(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // Line 25
  it('createAsset returns 400 on model failure', async () => {
    (AssetModel.createAsset as jest.Mock).mockRejectedValue(new Error('insert failed'));
    const req: any = { body: { name: 'Laptop' } };
    const res = mockRes();
    await createAsset(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // Lines 40-41
  it('checkoutAsset returns 404 when asset not found', async () => {
    (AssetModel.getAssetById as jest.Mock).mockResolvedValue(null);
    const req: any = { params: { id: '1' }, body: {}, user: { id: 1 } };
    const res = mockRes();
    await checkoutAsset(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  // Line 54
  it('checkoutAsset returns 409 when asset is not available', async () => {
    (AssetModel.getAssetById as jest.Mock).mockResolvedValue({ status: 'checked_out' });
    const req: any = { params: { id: '1' }, body: {}, user: { id: 1 } };
    const res = mockRes();
    await checkoutAsset(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  // Lines 64-65
  it('checkinAsset returns 409 when no active checkout exists', async () => {
    (AssetModel.getActiveCheckoutByAsset as jest.Mock).mockResolvedValue(null);
    const req: any = { params: { id: '1' } };
    const res = mockRes();
    await checkinAsset(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  // Line 73
  it('checkinAsset returns 500 on failure', async () => {
    (AssetModel.getActiveCheckoutByAsset as jest.Mock).mockResolvedValue({ id: 1 });
    (AssetModel.checkInAsset as jest.Mock).mockRejectedValue(new Error('update failed'));
    const req: any = { params: { id: '1' } };
    const res = mockRes();
    await checkinAsset(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});