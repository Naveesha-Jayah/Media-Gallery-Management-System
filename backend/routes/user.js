const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

router.get('/me', protect, userController.getMe);
router.put('/me', protect, userController.updateMe);

module.exports = router;