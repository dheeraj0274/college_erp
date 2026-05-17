import { Router } from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', authorize('admin', 'superadmin', 'hod'), createStudent);
router.put('/:id', authorize('admin', 'superadmin', 'hod'), updateStudent);
router.delete('/:id', authorize('admin', 'superadmin'), deleteStudent);

export default router;
