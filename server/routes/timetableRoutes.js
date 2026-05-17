import { Router } from 'express';
import { getTimetable, createTimetable, updateTimetable, deleteTimetable } from '../controllers/timetableController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', getTimetable);
router.post('/', authorize('admin', 'superadmin', 'hod'), createTimetable);
router.put('/:id', authorize('admin', 'superadmin', 'hod'), updateTimetable);
router.delete('/:id', authorize('admin', 'superadmin'), deleteTimetable);

export default router;
