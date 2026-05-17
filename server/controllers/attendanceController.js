import Attendance from '../models/Attendance.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

export const markAttendance = asyncHandler(async (req, res) => {
  const { records } = req.body;
  const results = await Attendance.insertMany(
    records.map((r) => ({ ...r, markedBy: req.user.id })),
    { ordered: false }
  );
  res.status(201).json({ success: true, message: `Attendance marked for ${results.length} students`, data: { count: results.length } });
});

import Student from '../models/Student.js';

export const getAttendance = asyncHandler(async (req, res) => {
  const { subject, date, student, user, page = 1, limit = 50 } = req.query;
  const query = {};
  if (subject) query.subject = subject;
  if (date) query.date = new Date(date);
  if (student) query.student = student;
  
  if (user) {
    const studentDoc = await Student.findOne({ user });
    if (studentDoc) query.student = studentDoc._id;
  }

  const attendance = await Attendance.find(query)
    .populate('student', 'rollNo')
    .populate('subject', 'name code')
    .populate('markedBy', 'name')
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Attendance.countDocuments(query);
  res.json({ success: true, data: { attendance, total, page: Number(page), pages: Math.ceil(total / limit) } });
});

export const getAttendanceByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const attendance = await Attendance.find({ student: studentId })
    .populate('subject', 'name code')
    .sort({ date: -1 });

  const stats = {};
  attendance.forEach((a) => {
    const key = a.subject._id.toString();
    if (!stats[key]) stats[key] = { subject: a.subject, total: 0, present: 0, absent: 0 };
    stats[key].total++;
    if (a.status === 'present') stats[key].present++;
    else stats[key].absent++;
  });

  res.json({ success: true, data: { attendance, stats: Object.values(stats) } });
});

export const getAttendanceStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAttendance = await Attendance.find({ date: { $gte: today } });
  const present = todayAttendance.filter((a) => a.status === 'present').length;
  const total = todayAttendance.length;

  res.json({
    success: true,
    data: { today: { present, absent: total - present, total, percentage: total ? ((present / total) * 100).toFixed(1) : 0 } },
  });
});
