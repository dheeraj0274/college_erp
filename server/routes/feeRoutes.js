import { Router } from 'express';
import { getFees, getFeeById, createFee, recordPayment, getFeeStats } from '../controllers/feeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getFees);
router.get('/stats', getFeeStats);
router.get('/:id', getFeeById);
router.post('/', authorize('admin', 'superadmin', 'accountant'), createFee);
router.post('/:id/payment', authorize('admin', 'superadmin', 'accountant'), recordPayment);

export default router;
