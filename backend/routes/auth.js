const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyOTP } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/verify-email', verifyOTP, authController.verifyEmail);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', verifyOTP, authController.resetPassword);
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);
router.get('/logout', authController.logout);

module.exports = router;