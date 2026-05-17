import { Router } from 'express';
import { getSubjects, getSubjectById, createSubject, updateSubject, deleteSubject } from '../controllers/subjectController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getSubjects);
router.get('/:id', getSubjectById);
router.post('/', authorize('admin', 'superadmin', 'hod'), createSubject);
router.put('/:id', authorize('admin', 'superadmin', 'hod'), updateSubject);
router.delete('/:id', authorize('admin', 'superadmin'), deleteSubject);

export default router;
