const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const contactController = require('../controllers/contactController');

// User routes
router.post('/contact', protect, contactController.createMessage);
router.get('/contact/mymessages', protect, contactController.getMyMessages);
router.put('/contact/:id', protect, contactController.updateMyMessage);
router.delete('/contact/:id', protect, contactController.deleteMyMessage);

// Admin routes
router.get('/admin/contact', protect, adminOnly, contactController.getAllMessages);
router.delete('/admin/contact/:id', protect, adminOnly, contactController.adminDeleteMessage);

module.exports = router; 