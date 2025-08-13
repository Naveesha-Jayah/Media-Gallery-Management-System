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
	const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
	if (allowed.includes(file.mimetype)) cb(null, true);
	else cb(new Error('Only JPG/PNG files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/media', protect, mediaController.list);
router.get('/media/:id', protect, mediaController.getOne);
router.post('/media', protect, upload.single('file'), mediaController.create);
router.put('/media/:id', protect, mediaController.update);
router.delete('/media/:id', protect, mediaController.remove);
router.post('/media/zip', protect, mediaController.zipSelected);

module.exports = router; 