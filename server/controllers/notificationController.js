import Notification from '../models/Notification.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const notifications = await Notification.find({ isActive: true })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Notification.countDocuments({ isActive: true });
  const unread = await Notification.countDocuments({ isActive: true, readBy: { $ne: req.user.id } });

  res.json({ success: true, data: { notifications, total, unread, page: Number(page), pages: Math.ceil(total / limit) } });
});

export const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, message: 'Notification created', data: { notification } });
});

export const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: req.user.id } });
  res.json({ success: true, message: 'Marked as read' });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ readBy: { $ne: req.user.id } }, { $addToSet: { readBy: req.user.id } });
  res.json({ success: true, message: 'All marked as read' });
});
