import Subject from '../models/Subject.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

export const getSubjects = asyncHandler(async (req, res) => {
  const { search, department, semester, page = 1, limit = 50 } = req.query;
  const query = {};
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { code: { $regex: search, $options: 'i' } }];
  if (department) query.department = department;
  if (semester) query.semester = Number(semester);

  const subjects = await Subject.find(query)
    .populate('department', 'name code')
    .populate('faculty', 'name email')
    .sort({ code: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Subject.countDocuments(query);
  res.json({ success: true, data: { subjects, total, page: Number(page), pages: Math.ceil(total / limit) } });
});

export const getSubjectById = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findById(req.params.id).populate('department', 'name code').populate('faculty', 'name email');
  if (!subject) return next(new AppError('Subject not found', 404));
  res.json({ success: true, data: { subject } });
});

export const createSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.create(req.body);
  res.status(201).json({ success: true, message: 'Subject created', data: { subject } });
});

export const updateSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!subject) return next(new AppError('Subject not found', 404));
  res.json({ success: true, message: 'Subject updated', data: { subject } });
});

export const deleteSubject = asyncHandler(async (req, res, next) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) return next(new AppError('Subject not found', 404));
  res.json({ success: true, message: 'Subject deleted' });
});
