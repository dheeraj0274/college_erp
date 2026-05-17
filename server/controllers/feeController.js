import Student from '../models/Student.js';
import Fee from '../models/Fee.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';

export const getFees = asyncHandler(async (req, res) => {
  const { student, status, user, page = 1, limit = 20 } = req.query;
  const query = {};
  if (student) query.student = student;
  if (status) query.status = status;

  if (user) {
    const studentDoc = await Student.findOne({ user });
    if (studentDoc) query.student = studentDoc._id;
  }

  const fees = await Fee.find(query)
    .populate({ path: 'student', populate: [{ path: 'user', select: 'name email' }, { path: 'department', select: 'name code' }] })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Fee.countDocuments(query);
  res.json({ success: true, data: { fees, total, page: Number(page), pages: Math.ceil(total / limit) } });
});

export const getFeeById = asyncHandler(async (req, res, next) => {
  const fee = await Fee.findById(req.params.id)
    .populate({ path: 'student', populate: [{ path: 'user', select: 'name email' }] });
  if (!fee) return next(new AppError('Fee record not found', 404));
  res.json({ success: true, data: { fee } });
});

export const createFee = asyncHandler(async (req, res) => {
  const fee = await Fee.create(req.body);
  res.status(201).json({ success: true, message: 'Fee record created', data: { fee } });
});

export const recordPayment = asyncHandler(async (req, res, next) => {
  const fee = await Fee.findById(req.params.id);
  if (!fee) return next(new AppError('Fee record not found', 404));

  const { amount, method, transactionId } = req.body;
  fee.payments.push({ amount, method, transactionId, receiptNo: `RCP-${Date.now()}` });
  fee.paidAmount += amount;

  if (fee.paidAmount >= fee.totalAmount) fee.status = 'paid';
  else if (fee.paidAmount > 0) fee.status = 'partial';

  await fee.save();
  res.json({ success: true, message: 'Payment recorded', data: { fee } });
});

export const getFeeStats = asyncHandler(async (req, res) => {
  const fees = await Fee.find();
  const totalCollected = fees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = fees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0);
  const paidCount = fees.filter((f) => f.status === 'paid').length;
  const partialCount = fees.filter((f) => f.status === 'partial').length;
  const unpaidCount = fees.filter((f) => f.status === 'unpaid').length;

  res.json({
    success: true,
    data: { totalCollected, totalPending, totalRecords: fees.length, paidCount, partialCount, unpaidCount },
  });
});
