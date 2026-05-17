import { Router } from 'express';
import { getNotifications, createNotification, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getNotifications);
router.post('/', authorize('admin', 'superadmin', 'hod', 'faculty'), createNotification);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

export default router;
