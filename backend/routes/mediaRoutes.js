const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const mediaController = require('../controllers/mediaController');

const router = express.Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
	filename: (req, file, cb) => {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, unique + ext);
	}
});

const fileFilter = (req, file, cb) => {
	// Allow images, videos, documents, and audio files
	const allowedTypes = [
		// Images
		'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
		// Videos
		'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm',
		// Documents
		'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'text/plain', 'text/html', 'text/css', 'text/javascript',
		// Audio
		'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/aac'
	];
	
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error(`File type ${file.mimetype} not allowed. Supported types: images, videos, documents, audio.`));
	}
};

// Single file upload (10MB limit)
const upload = multer({ 
	storage, 
	fileFilter, 
	limits: { fileSize: 10 * 1024 * 1024 } 
});

// Multiple file upload (5 files, 5MB each)
const uploadMultiple = multer({ 
	storage, 
	fileFilter, 
	limits: { 
		fileSize: 5 * 1024 * 1024,
		files: 5
	} 
});

// Large file upload (100MB limit)
const uploadLarge = multer({ 
	storage, 
	fileFilter, 
	limits: { fileSize: 100 * 1024 * 1024 } 
});

// Basic CRUD operations
router.get('/media', protect, mediaController.list);
router.get('/media/stats', protect, mediaController.getStats);
router.get('/media/deleted', protect, mediaController.getDeleted);
router.get('/media/:id', protect, mediaController.getOne);

// Create operations
router.post('/media', protect, upload.single('file'), mediaController.create);
router.post('/media/multiple', protect, uploadMultiple.array('files', 5), mediaController.createMultiple);
router.post('/media/large', protect, uploadLarge.single('file'), mediaController.create);

// Update operations
router.put('/media/:id', protect, mediaController.update);
router.put('/media/bulk', protect, mediaController.updateMultiple);

// Delete operations
router.delete('/media/:id', protect, mediaController.remove);
router.delete('/media/bulk', protect, mediaController.removeMultiple);
router.delete('/media/:id/permanent', protect, mediaController.hardDelete);

// Restore operations
router.patch('/media/:id/restore', protect, mediaController.restore);

// Utility operations
router.post('/media/zip', protect, mediaController.zipSelected);

module.exports = router; 