import { Router } from 'express';
import { getResults, createResult, bulkCreateResults, updateResult, deleteResult } from '../controllers/resultController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', getResults);
router.post('/', authorize('admin', 'superadmin', 'faculty', 'hod'), createResult);
router.post('/bulk', authorize('admin', 'superadmin', 'faculty', 'hod'), bulkCreateResults);
router.put('/:id', authorize('admin', 'superadmin', 'faculty', 'hod'), updateResult);
router.delete('/:id', authorize('admin', 'superadmin'), deleteResult);

export default router;
