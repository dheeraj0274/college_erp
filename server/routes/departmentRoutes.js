import { Router } from 'express';
import { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.post('/', authorize('admin', 'superadmin'), createDepartment);
router.put('/:id', authorize('admin', 'superadmin'), updateDepartment);
router.delete('/:id', authorize('admin', 'superadmin'), deleteDepartment);

export default router;
