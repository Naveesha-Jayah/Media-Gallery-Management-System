const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/admin-register', authController.adminRegister);
router.post('/login', authController.login);
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleAuthCallback);
router.get('/logout', authController.logout);

// Admin only route to promote users
router.post('/promote/:userId', protect, adminOnly, authController.promoteToAdmin);

// Admin only route to demote admins
router.post('/demote/:userId', protect, adminOnly, authController.demoteToUser);

module.exports = router;