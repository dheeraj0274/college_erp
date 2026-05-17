import Assignment from '../models/Assignment.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAssignments = asyncHandler(async (req, res) => {
  const { department, semester, subject, page = 1, limit = 20 } = req.query;
  const query = { isActive: true };
  if (department) query.department = department;
  if (semester) query.semester = Number(semester);
  if (subject) query.subject = subject;

  const assignments = await Assignment.find(query)
    .populate('subject', 'name code')
    .populate('department', 'name code')
    .populate('createdBy', 'name')
    .sort({ dueDate: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Assignment.countDocuments(query);
  res.json({ success: true, data: { assignments, total, page: Number(page), pages: Math.ceil(total / limit) } });
});

export const getAssignmentById = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('subject', 'name code')
    .populate('department', 'name code')
    .populate('createdBy', 'name')
    .populate('submissions.student', 'rollNo');
  if (!assignment) return next(new AppError('Assignment not found', 404));
  res.json({ success: true, data: { assignment } });
});

export const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, message: 'Assignment created', data: { assignment } });
});

export const updateAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!assignment) return next(new AppError('Assignment not found', 404));
  res.json({ success: true, message: 'Assignment updated', data: { assignment } });
});

export const deleteAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) return next(new AppError('Assignment not found', 404));
  res.json({ success: true, message: 'Assignment deleted' });
});
