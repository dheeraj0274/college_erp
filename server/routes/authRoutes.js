import { Router } from 'express';
import { register, login, logout, refreshAccessToken, forgotPassword, resetPassword, verifyOTP, resendOTP, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/profile', protect, getProfile);

export default router;
