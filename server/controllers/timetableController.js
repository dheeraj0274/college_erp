import Timetable from '../models/Timetable.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

export const getTimetable = asyncHandler(async (req, res) => {
  const { department, semester } = req.query;
  const query = {};
  if (department) query.department = department;
  if (semester) query.semester = Number(semester);

  const timetable = await Timetable.find(query)
    .populate('department', 'name code')
    .populate('slots.subject', 'name code')
    .populate('slots.faculty', 'name')
    .sort({ day: 1 });

  res.json({ success: true, data: { timetable } });
});

export const createTimetable = asyncHandler(async (req, res) => {
  const entry = await Timetable.create(req.body);
  res.status(201).json({ success: true, message: 'Timetable created', data: { entry } });
});

export const updateTimetable = asyncHandler(async (req, res, next) => {
  const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!entry) return next(new AppError('Entry not found', 404));
  res.json({ success: true, message: 'Timetable updated', data: { entry } });
});

export const deleteTimetable = asyncHandler(async (req, res, next) => {
  const entry = await Timetable.findByIdAndDelete(req.params.id);
  if (!entry) return next(new AppError('Entry not found', 404));
  res.json({ success: true, message: 'Timetable deleted' });
});
