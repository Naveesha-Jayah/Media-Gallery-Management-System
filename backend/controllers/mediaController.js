const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const MediaItem = require('../models/mediaItemModel');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

exports.list = async (req, res) => {
	try {
		const { q, tags, shared } = req.query;
		const filter = { isActive: true };
		if (shared === 'true') filter.isShared = true; else filter.user = req.user._id;
		if (q) filter.$or = [
			{ title: new RegExp(q, 'i') },
			{ description: new RegExp(q, 'i') },
		];
		if (tags) filter.tags = { $in: tags.split(',').map(t => t.trim()).filter(Boolean) };
		const items = await MediaItem.find(filter).sort({ createdAt: -1 });
		res.json(items);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

exports.getOne = async (req, res) => {
	try {
		const { id } = req.params;
		const item = await MediaItem.findOne({ _id: id, isActive: true });
		if (!item) return res.status(404).json({ message: 'Not found' });
		if (!item.isShared && String(item.user) !== String(req.user._id)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		res.json(item);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

exports.create = async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
		const { title = '', description = '', tags = '', isShared = false } = req.body;
		const item = await MediaItem.create({
			user: req.user._id,
			title,
			description,
			tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags,
			originalName: req.file.originalname,
			filename: req.file.filename,
			mimeType: req.file.mimetype,
			size: req.file.size,
			isShared: isShared === 'true' || isShared === true
		});
		res.status(201).json(item);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

exports.update = async (req, res) => {
	try {
		const { id } = req.params;
		const item = await MediaItem.findOne({ _id: id, user: req.user._id, isActive: true });
		if (!item) return res.status(404).json({ message: 'Not found' });
		const { title, description, tags, isShared } = req.body;
		if (title !== undefined) item.title = title;
		if (description !== undefined) item.description = description;
		if (tags !== undefined) item.tags = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean);
		if (isShared !== undefined) item.isShared = isShared === 'true' || isShared === true;
		await item.save();
		res.json(item);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

exports.remove = async (req, res) => {
	try {
		const { id } = req.params;
		const item = await MediaItem.findOne({ _id: id, user: req.user._id, isActive: true });
		if (!item) return res.status(404).json({ message: 'Not found' });
		item.isActive = false;
		await item.save();
		res.json({ message: 'Deleted' });
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

exports.zipSelected = async (req, res) => {
	try {
		const { ids } = req.body; // array of ids
		if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: 'No ids provided' });
		const items = await MediaItem.find({ _id: { $in: ids }, user: req.user._id, isActive: true });
		if (items.length === 0) return res.status(404).json({ message: 'No items found' });

		res.setHeader('Content-Type', 'application/zip');
		res.setHeader('Content-Disposition', 'attachment; filename="media.zip"');
		const archive = archiver('zip');
		archive.on('error', err => res.status(500).end());
		archive.pipe(res);
		for (const item of items) {
			const filePath = path.join(UPLOAD_DIR, item.filename);
			archive.file(filePath, { name: item.originalName });
		}
		archive.finalize();
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
}; 