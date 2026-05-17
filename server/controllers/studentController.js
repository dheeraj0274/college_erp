import User from '../models/User.js';
import Student from '../models/Student.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

export const getStudents = asyncHandler(async (req, res) => {
  const { search, department, semester, page = 1, limit = 20 } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { rollNo: { $regex: search, $options: 'i' } },
    ];
  }
  if (department) query.department = department;
  if (semester) query.semester = Number(semester);

  const students = await Student.find(query)
    .populate('user', 'name email phone isActive avatar')
    .populate('department', 'name code')
    .sort({ rollNo: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Student.countDocuments(query);

  res.json({
    success: true,
    data: { students, total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

export const getStudentById = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id)
    .populate('user', 'name email phone isActive avatar')
    .populate('department', 'name code');
  if (!student) return next(new AppError('Student not found', 404));
  res.json({ success: true, data: { student } });
});

export const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, phone, rollNo, department, semester, section, batch, admissionYear, fatherName, motherName, dob, address, bloodGroup } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError('Email already registered', 400);

  const user = await User.create({ name, email, password: password || 'student123', role: 'student', phone, department, isVerified: true });

  const student = await Student.create({
    user: user._id, rollNo, department, semester, section, batch, admissionYear, fatherName, motherName, dob, address, bloodGroup,
  });

  res.status(201).json({ success: true, message: 'Student created', data: { student } });
});

export const updateStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);
  if (!student) return next(new AppError('Student not found', 404));

  const { name, email, phone, ...studentData } = req.body;
  if (name || email || phone) {
    await User.findByIdAndUpdate(student.user, { name, email, phone });
  }

  const updated = await Student.findByIdAndUpdate(req.params.id, studentData, { new: true, runValidators: true })
    .populate('user', 'name email phone isActive')
    .populate('department', 'name code');

  res.json({ success: true, message: 'Student updated', data: { student: updated } });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);
  if (!student) return next(new AppError('Student not found', 404));
  await User.findByIdAndDelete(student.user);
  await Student.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Student deleted' });
});
