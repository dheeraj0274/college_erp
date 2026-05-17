import Student from '../models/Student.js';
import Result from '../models/Result.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

export const getResults = asyncHandler(async (req, res) => {
  const { student, subject, semester, examType, user, page = 1, limit = 50 } = req.query;
  const query = {};
  if (student) query.student = student;
  if (subject) query.subject = subject;
  if (semester) query.semester = Number(semester);
  if (examType) query.examType = examType;
  
  if (user) {
    const studentDoc = await Student.findOne({ user });
    if (studentDoc) query.student = studentDoc._id;
  }

  const results = await Result.find(query)
    .populate({ path: 'student', populate: [{ path: 'user', select: 'name' }, { path: 'department', select: 'name code' }] })
    .populate('subject', 'name code credits')
    .populate('publishedBy', 'name')
    .sort({ publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Result.countDocuments(query);
  res.json({ success: true, data: { results, total, page: Number(page), pages: Math.ceil(total / limit) } });
});

export const createResult = asyncHandler(async (req, res) => {
  const result = await Result.create({ ...req.body, publishedBy: req.user.id });
  res.status(201).json({ success: true, message: 'Result published', data: { result } });
});

export const bulkCreateResults = asyncHandler(async (req, res) => {
  const { results: records } = req.body;
  const created = await Result.insertMany(records.map(r => ({ ...r, publishedBy: req.user.id })), { ordered: false });
  res.status(201).json({ success: true, message: `Published ${created.length} results`, data: { count: created.length } });
});

export const updateResult = asyncHandler(async (req, res, next) => {
  const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!result) return next(new AppError('Result not found', 404));
  res.json({ success: true, message: 'Result updated', data: { result } });
});

export const deleteResult = asyncHandler(async (req, res, next) => {
  const result = await Result.findByIdAndDelete(req.params.id);
  if (!result) return next(new AppError('Result not found', 404));
  res.json({ success: true, message: 'Result deleted' });
});
