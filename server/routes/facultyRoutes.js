import { Router } from 'express';
import { getFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty } from '../controllers/facultyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getFaculty);
router.get('/:id', getFacultyById);
router.post('/', authorize('admin', 'superadmin'), createFaculty);
router.put('/:id', authorize('admin', 'superadmin'), updateFaculty);
router.delete('/:id', authorize('admin', 'superadmin'), deleteFaculty);

export default router;
