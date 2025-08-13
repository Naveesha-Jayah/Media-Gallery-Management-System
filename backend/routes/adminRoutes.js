const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.get('/users', protect, adminOnly, adminController.listUsers);
router.put('/users/:id', protect, adminOnly, adminController.updateUser);
router.delete('/users/:id', protect, adminOnly, adminController.softDeleteUser);

module.exports = router; 