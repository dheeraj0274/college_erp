import Department from '../models/Department.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

export const getDepartments = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const query = {};
  if (search) query.name = { $regex: search, $options: 'i' };

  const departments = await Department.find(query)
    .populate('hod', 'name email')
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Department.countDocuments(query);

  res.json({
    success: true,
    data: { departments, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

export const getDepartmentById = asyncHandler(async (req, res, next) => {
  const department = await Department.findById(req.params.id).populate('hod', 'name email');
  if (!department) return next(new AppError('Department not found', 404));
  res.json({ success: true, data: { department } });
});

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, message: 'Department created', data: { department } });
});

export const updateDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!department) return next(new AppError('Department not found', 404));
  res.json({ success: true, message: 'Department updated', data: { department } });
});

export const deleteDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) return next(new AppError('Department not found', 404));
  res.json({ success: true, message: 'Department deleted' });
});
