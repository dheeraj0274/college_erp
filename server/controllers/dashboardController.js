import User from '../models/User.js';
import Student from '../models/Student.js';
import Department from '../models/Department.js';
import Subject from '../models/Subject.js';
import Fee from '../models/Fee.js';
import Attendance from '../models/Attendance.js';
import Assignment from '../models/Assignment.js';
import Result from '../models/Result.js';
import Notification from '../models/Notification.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalStudents, totalFaculty, totalDepartments, totalSubjects] = await Promise.all([
    Student.countDocuments(),
    User.countDocuments({ role: { $in: ['faculty', 'hod'] } }),
    Department.countDocuments(),
    Subject.countDocuments({ isActive: true }),
  ]);

  const fees = await Fee.find();
  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = fees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0);
  const feeDefaulters = fees.filter(f => f.status === 'unpaid' || f.status === 'overdue').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAttendance = await Attendance.find({ date: { $gte: today } });
  const present = todayAttendance.filter((a) => a.status === 'present').length;

  const totalAssignments = await Assignment.countDocuments({ isActive: true });
  const pendingAssignments = await Assignment.countDocuments({ isActive: true, dueDate: { $gte: new Date() } });

  const recentNotifications = await Notification.find({ isActive: true })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentResults = await Result.find()
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .populate('subject', 'code')
    .sort({ publishedAt: -1 })
    .limit(3);

  if (req.user.role === 'student') {
    const studentDoc = await Student.findOne({ user: req.user.id });
    if (!studentDoc) return next(new AppError('Student profile not found', 404));

    const [attendanceTotal, attendancePresent, assignments, results, fee, recentAttendance] = await Promise.all([
      Attendance.countDocuments({ student: studentDoc._id }),
      Attendance.countDocuments({ student: studentDoc._id, status: 'present' }),
      Assignment.countDocuments({ department: studentDoc.department, isActive: true }),
      Result.findOne({ student: studentDoc._id }).sort({ publishedAt: -1 }),
      Fee.findOne({ student: studentDoc._id }).sort({ semester: -1 }),
      Attendance.find({ student: studentDoc._id }).populate('subject', 'name').sort({ date: -1 }).limit(10)
    ]);

    const attPercentage = attendanceTotal ? Math.round((attendancePresent / attendanceTotal) * 100) : 0;

    return res.json({
      success: true,
      data: {
        isStudent: true,
        attendance: `${attPercentage}%`,
        assignmentsDue: assignments,
        latestResult: results ? results.grade : 'N/A',
        feeStatus: fee ? fee.status : 'N/A',
        recentAttendance
      }
    });
  }

  res.json({
    success: true,
    data: {
      totalStudents,
      totalFaculty,
      totalDepartments,
      totalSubjects,
      feeCollection: { collected: totalCollected, pending: totalPending },
      feeDefaulters,
      todayAttendance: {
        present,
        total: todayAttendance.length,
        percentage: todayAttendance.length ? ((present / todayAttendance.length) * 100).toFixed(1) : 0,
      },
      totalAssignments,
      pendingAssignments,
      recentNotifications,
      recentResults,
    },
  });
});
