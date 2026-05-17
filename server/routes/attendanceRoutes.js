import { Router } from 'express';
import { markAttendance, getAttendance, getAttendanceByStudent, getAttendanceStats } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getAttendance);
router.get('/stats', getAttendanceStats);
router.get('/student/:studentId', getAttendanceByStudent);
router.post('/', authorize('faculty', 'hod', 'admin', 'superadmin'), markAttendance);

export default router;
