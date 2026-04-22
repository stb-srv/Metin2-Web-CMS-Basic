const express = require('express');
const router = express.Router();
const isAuth = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');
const authController = require('./controller');
const { authLimiter, registerLimiter } = require('../../config/rateLimiters');
const validate = require('../../middleware/validate');
const { registerSchema, loginSchema, updatePasswordSchema, updateSecurityQuestionSchema } = require('./validation');

// Register endpoint
router.post('/register', registerLimiter, validate(registerSchema), asyncHandler(authController.register));

// Login endpoint
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));

// Logout endpoint
router.post('/logout', asyncHandler(authController.logout));

// Fetch live user balance
router.get('/me', isAuth, asyncHandler(authController.getMe));

// Fetch Account Settings (Masked Email & partial Social ID)
router.get('/settings', isAuth, asyncHandler(authController.getSettings));

// Update Password
router.post('/update-password', isAuth, validate(updatePasswordSchema), asyncHandler(authController.updatePassword));

// Update Security Question
router.post('/update-security-question', isAuth, validate(updateSecurityQuestionSchema), asyncHandler(authController.updateSecurityQuestion));

// Update Social ID (Löschcode)
router.post('/update-social-id', isAuth, asyncHandler(authController.updateSocialId));

// Fetch Account Characters
router.get('/characters', isAuth, asyncHandler(authController.getCharacters));

// Unstuck Character
router.post('/characters/:id/unstuck', isAuth, asyncHandler(authController.unstuckCharacter));

// Forgot Password
router.post('/forgot-password', authLimiter, asyncHandler(authController.forgotPassword));

// Reset Password
router.post('/reset-password', authLimiter, asyncHandler(authController.resetPassword));

module.exports = router;

