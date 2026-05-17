import { Router } from 'express';
import { getAssignments, getAssignmentById, createAssignment, updateAssignment, deleteAssignment } from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', getAssignments);
router.get('/:id', getAssignmentById);
router.post('/', authorize('admin', 'superadmin', 'faculty', 'hod'), createAssignment);
router.put('/:id', authorize('admin', 'superadmin', 'faculty', 'hod'), updateAssignment);
router.delete('/:id', authorize('admin', 'superadmin'), deleteAssignment);

export default router;
