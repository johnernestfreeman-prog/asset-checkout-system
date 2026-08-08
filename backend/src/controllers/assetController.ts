import { Request, Response } from 'express';
import * as AssetModel from '../models/assetModel';

export const getAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const assets = await AssetModel.getAllAssets();
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve assets.', error: (error as Error).message });
  }
};

export const createAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, serial_number } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Asset name is required.' });
      return;
    }

    const asset = await AssetModel.createAsset(name, category || null, serial_number || null);
    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create asset.', error: (error as Error).message });
  }
};




export const checkoutAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const assetId = Number(req.params.id);
    const { due_date, notes } = req.body;
    const userId = req.user!.id;

    const asset = await AssetModel.getAssetById(assetId);
    if (!asset) {
      res.status(404).json({ message: 'Asset not found.' });
      return;
    }

    if (asset.status !== 'available') {
      res.status(409).json({ message: `Asset is currently ${asset.status}, cannot check out.` });
      return;
    }

    const checkout = await AssetModel.createCheckout(assetId, userId, due_date || null, notes || null);
    await AssetModel.updateAssetStatus(assetId, 'checked_out');

    res.status(201).json(checkout);
  } catch (error) {
    res.status(500).json({ message: 'Checkout failed.', error: (error as Error).message });
  }
};

export const checkinAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const assetId = Number(req.params.id);

    const activeCheckout = await AssetModel.getActiveCheckoutByAsset(assetId);
    if (!activeCheckout) {
      res.status(409).json({ message: 'This asset has no active checkout.' });
      return;
    }

    const checkedIn = await AssetModel.checkInAsset(activeCheckout.id);
    await AssetModel.updateAssetStatus(assetId, 'available');

    res.status(200).json(checkedIn);
  } catch (error) {
    res.status(500).json({ message: 'Check-in failed.', error: (error as Error).message });
  }
};