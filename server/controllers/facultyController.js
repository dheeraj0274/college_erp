import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

export const getFaculty = asyncHandler(async (req, res) => {
  const { search, department, page = 1, limit = 20 } = req.query;
  const query = { role: { $in: ['faculty', 'hod'] } };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (department) query.department = department;

  const faculty = await User.find(query)
    .select('-password -refreshToken -otp -otpExpiry -resetPasswordToken -resetPasswordExpiry')
    .populate('department', 'name code')
    .sort({ name: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: { faculty, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

export const getFacultyById = asyncHandler(async (req, res, next) => {
  const faculty = await User.findById(req.params.id)
    .select('-password -refreshToken -otp -otpExpiry')
    .populate('department', 'name code');
  if (!faculty) return next(new AppError('Faculty not found', 404));
  res.json({ success: true, data: { faculty } });
});

export const createFaculty = asyncHandler(async (req, res) => {
  const { name, email, password, phone, department, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('Email already registered', 400);

  const faculty = await User.create({
    name, email, password: password || 'faculty123',
    role: role || 'faculty', phone, department, isVerified: true,
  });

  res.status(201).json({ success: true, message: 'Faculty created', data: { faculty } });
});

export const updateFaculty = asyncHandler(async (req, res, next) => {
  const faculty = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .select('-password -refreshToken');
  if (!faculty) return next(new AppError('Faculty not found', 404));
  res.json({ success: true, message: 'Faculty updated', data: { faculty } });
});

export const deleteFaculty = asyncHandler(async (req, res, next) => {
  const faculty = await User.findByIdAndDelete(req.params.id);
  if (!faculty) return next(new AppError('Faculty not found', 404));
  res.json({ success: true, message: 'Faculty deleted' });
});
