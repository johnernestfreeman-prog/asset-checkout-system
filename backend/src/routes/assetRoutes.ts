import { Router } from 'express';
import { getAssets, createAsset, checkoutAsset, checkinAsset } from '../controllers/assetController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

// All asset routes require a logged-in user
router.use(requireAuth);

// GET /assets - any logged-in user can view assets
router.get('/', getAssets);

// POST /assets - admin only, adds new equipment to inventory
router.post('/', requireRole('admin'), createAsset);

// POST /assets/:id/checkout - any logged-in user can check out available equipment
router.post('/:id/checkout', checkoutAsset);

// POST /assets/:id/checkin - any logged-in user can check equipment back in
router.post('/:id/checkin', checkinAsset);

export default router;