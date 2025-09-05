const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const {
    sendAbhaOtpSchema,
    verifyAbhaOtpSchema,
    sendAadhaarOtpSchema, // <-- IMPORTED
    verifyAadhaarOtpSchema, // <-- IMPORTED
    hprRegisterSchema,
    hprLoginSchema,
    refreshTokenSchema,
} = require('../utils/validator');
const rateLimiter = require('../middleware/rateLimit');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// --- ABHA Patient Routes ---
router.post('/abha/send-otp', rateLimiter.auth, validate(sendAbhaOtpSchema), authController.sendAbhaOtp);
router.post('/abha/verify-otp', rateLimiter.auth, validate(verifyAbhaOtpSchema), authController.verifyAbhaOtp);

// --- ADDED: Aadhaar Patient Routes ---
router.post('/aadhar/send-otp', rateLimiter.auth, validate(sendAadhaarOtpSchema), authController.sendAadhaarOtp);
router.post('/aadhar/verify-otp', rateLimiter.auth, validate(verifyAadhaarOtpSchema), authController.verifyAadhaarOtp);

// --- Doctor Routes ---
router.post('/hpr/register', rateLimiter.auth, validate(hprRegisterSchema), authController.hprRegister);
router.post('/hpr/login', rateLimiter.auth, validate(hprLoginSchema), authController.hprLogin);

// --- Token Management ---
router.post('/refresh', rateLimiter.auth, validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;