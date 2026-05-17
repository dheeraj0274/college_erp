import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'danger'], default: 'info' },
  target: { type: String, enum: ['all', 'students', 'faculty', 'department'], default: 'all' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
