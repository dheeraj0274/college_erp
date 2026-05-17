import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../services/emailService.js';

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE });
  return { accessToken, refreshToken };
};

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(new AppError('Email already registered', 400));

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const user = await User.create({
    name, email, password, role: role || 'student',
    otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendOTPEmail(email, otp);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
    data: { userId: user._id },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid credentials', 401));
  }

  if (!user.isActive) return next(new AppError('Account is deactivated', 403));

  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      accessToken,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return next(new AppError('No refresh token', 401));

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid refresh token', 401));
  }

  const tokens = generateTokens(user._id, user.role);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, data: { accessToken: tokens.accessToken } });
});

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No user found with that email', 404));

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendPasswordResetEmail(user.email, resetUrl);

  res.json({ success: true, message: 'Password reset email sent' });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Invalid or expired reset token', 400));

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;
  await user.save();

  res.json({ success: true, message: 'Password reset successful' });
});

export const verifyOTP = asyncHandler(async (req, res, next) => {
  const { userId, otp } = req.body;
  const user = await User.findById(userId);

  if (!user) return next(new AppError('User not found', 404));
  if (user.otp !== otp || user.otpExpiry < Date.now()) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'Email verified successfully' });
});

export const resendOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Please provide an email address', 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError('No user found with that email', 404));
  if (user.isVerified) return next(new AppError('Email is already verified', 400));

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  await sendOTPEmail(email, otp);

  res.json({ success: true, message: 'OTP resent successfully' });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('department');
  res.json({ success: true, data: { user } });
});
