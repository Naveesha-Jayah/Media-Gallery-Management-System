const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const MediaItem = require('../models/mediaItemModel');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// List media items with advanced filtering and pagination
exports.list = async (req, res) => {
	try {
		const { 
			q, 
			tags, 
			shared, 
			page = 1, 
			limit = 20, 
			sortBy = 'createdAt', 
			sortOrder = 'desc',
			category,
			dateFrom,
			dateTo
		} = req.query;
		
		const filter = { isActive: true };
		
		// User filter
		if (shared === 'true') {
			filter.isShared = true;
		} else {
			filter.user = req.user._id;
		}
		
		// Search filter
		if (q) {
			filter.$or = [
				{ title: new RegExp(q, 'i') },
				{ description: new RegExp(q, 'i') },
				{ originalName: new RegExp(q, 'i') }
			];
		}
		
		// Tags filter
		if (tags) {
			filter.tags = { $in: tags.split(',').map(t => t.trim()).filter(Boolean) };
		}
		
		// Category filter
		if (category) {
			filter.category = category;
		}
		
		// Date range filter
		if (dateFrom || dateTo) {
			filter.createdAt = {};
			if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
			if (dateTo) filter.createdAt.$lte = new Date(dateTo);
		}
		
		// Pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);
		const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
		
		// Get total count for pagination
		const total = await MediaItem.countDocuments(filter);
		
		// Get items
		const items = await MediaItem.find(filter)
			.sort(sort)
			.skip(skip)
			.limit(parseInt(limit))
			.populate('user', 'name email');
		
		res.json({
			items,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / parseInt(limit))
			}
		});
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

// Get single media item
exports.getOne = async (req, res) => {
	try {
		const { id } = req.params;
		const item = await MediaItem.findOne({ _id: id, isActive: true })
			.populate('user', 'name email');
			
		if (!item) return res.status(404).json({ message: 'Media item not found' });
		
		// Check access permissions
		if (!item.isShared && String(item.user._id) !== String(req.user._id)) {
			return res.status(403).json({ message: 'Access denied' });
		}
		
		res.json(item);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

// Create single media item
exports.create = async (req, res) => {
	try {
		if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
		
		const { 
			title = '', 
			description = '', 
			tags = '', 
			isShared = false,
			category = 'general',
			location = '',
			dateTaken = null
		} = req.body;
		
		const item = await MediaItem.create({
			user: req.user._id,
			title: title || req.file.originalname,
			description,
			tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags,
			category,
			location,
			dateTaken: dateTaken ? new Date(dateTaken) : null,
			originalName: req.file.originalname,
			filename: req.file.filename,
			mimeType: req.file.mimetype,
			size: req.file.size,
			dimensions: req.body.dimensions || null,
			isShared: isShared === 'true' || isShared === true
		});
		
		res.status(201).json(item);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

// Create multiple media items (bulk upload)
exports.createMultiple = async (req, res) => {
	try {
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ message: 'No files uploaded' });
		}
		
		const { 
			title = '', 
			description = '', 
			tags = '', 
			isShared = false,
			category = 'general',
			location = '',
			dateTaken = null
		} = req.body;
		
		const mediaItems = [];
		
		for (const file of req.files) {
			const item = await MediaItem.create({
				user: req.user._id,
				title: title || file.originalname,
				description,
				tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags,
				category,
				location,
				dateTaken: dateTaken ? new Date(dateTaken) : null,
				originalName: file.originalname,
				filename: file.filename,
				mimeType: file.mimetype,
				size: file.size,
				dimensions: req.body.dimensions || null,
				isShared: isShared === 'true' || isShared === true
			});
			
			mediaItems.push(item);
		}
		
		res.status(201).json({
			message: `${mediaItems.length} files uploaded successfully`,
			items: mediaItems
		});
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

// Update media item
exports.update = async (req, res) => {
	try {
		const { id } = req.params;
		const item = await MediaItem.findOne({ _id: id, user: req.user._id, isActive: true });
		
		if (!item) return res.status(404).json({ message: 'Media item not found' });
		
		const { 
			title, 
			description, 
			tags, 
			isShared, 
			category,
			location,
			dateTaken
		} = req.body;
		
		// Update fields if provided
		if (title !== undefined) item.title = title;
		if (description !== undefined) item.description = description;
		if (tags !== undefined) {
			item.tags = Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()).filter(Boolean);
		}
		if (isShared !== undefined) item.isShared = isShared === 'true' || isShared === true;
		if (category !== undefined) item.category = category;
		if (location !== undefined) item.location = location;
		if (dateTaken !== undefined) item.dateTaken = dateTaken ? new Date(dateTaken) : null;
		
		await item.save();
		res.json(item);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

// Update multiple media items (bulk edit)
exports.updateMultiple = async (req, res) => {
	try {
		const { ids, updates } = req.body;
		
		if (!Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({ message: 'No IDs provided' });
		}
		
		if (!updates || Object.keys(updates).length === 0) {
			return res.status(400).json({ message: 'No updates provided' });
		}
		
		// Validate that user owns all items
		const items = await MediaItem.find({ 
			_id: { $in: ids }, 
			user: req.user._id, 
			isActive: true 
		});
		
		if (items.length !== ids.length) {
			return res.status(403).json({ message: 'Some items not found or access denied' });
		}
		
		// Prepare update data
		const updateData = {};
		if (updates.title !== undefined) updateData.title = updates.title;
		if (updates.description !== undefined) updateData.description = updates.description;
		if (updates.tags !== undefined) {
			updateData.tags = Array.isArray(updates.tags) ? updates.tags : String(updates.tags).split(',').map(t => t.trim()).filter(Boolean);
		}
		if (updates.isShared !== undefined) updateData.isShared = updates.isShared;
		if (updates.category !== undefined) updateData.category = updates.category;
		if (updates.location !== undefined) updateData.location = updates.location;
		if (updates.dateTaken !== undefined) updateData.dateTaken = updates.dateTaken ? new Date(updates.dateTaken) : null;
		
		// Update all items
		const result = await MediaItem.updateMany(
			{ _id: { $in: ids } },
			{ $set: updateData }
		);
		
		res.json({
			message: `${result.modifiedCount} items updated successfully`,
			modifiedCount: result.modifiedCount
		});
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

// Delete media item (soft delete)
exports.remove = async (req, res) => {
	try {
		const { id } = req.params;
		const item = await MediaItem.findOne({ _id: id, user: req.user._id, isActive: true });
		
		if (!item) return res.status(404).json({ message: 'Media item not found' });
		
		item.isActive = false;
		item.deletedAt = new Date();
		await item.save();
		
		res.json({ message: 'Media item deleted successfully' });
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

// Delete multiple media items (bulk delete)
exports.removeMultiple = async (req, res) => {
	try {
		const { ids } = req.body;
		
		if (!Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({ message: 'No IDs provided' });
		}
		
		// Validate that user owns all items
		const items = await MediaItem.find({ 
			_id: { $in: ids }, 
			user: req.user._id, 
			isActive: true 
		});
		
		if (items.length !== ids.length) {
			return res.status(403).json({ message: 'Some items not found or access denied' });
		}
		
		// Soft delete all items
		const result = await MediaItem.updateMany(
			{ _id: { $in: ids } },
			{ 
				$set: { 
					isActive: false, 
					deletedAt: new Date() 
				} 
			}
		);
		
		res.json({
			message: `${result.modifiedCount} items deleted successfully`,
			deletedCount: result.modifiedCount
		});
	} catch (e) {
		res.status(500).json({ message: e.message });
	};
};

// Hard delete media item (permanent removal)
exports.hardDelete = async (req, res) => {
	try {
		const { id } = req.params;
		const item = await MediaItem.findOne({ _id: id, user: req.user._id });
		
		if (!item) return res.status(404).json({ message: 'Media item not found' });
		
		// Remove file from disk
		const filePath = path.join(UPLOAD_DIR, item.filename);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
		
		// Remove from database
		await MediaItem.findByIdAndDelete(id);
		
		res.json({ message: 'Media item permanently deleted' });
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

// Restore deleted media item
exports.restore = async (req, res) => {
	try {
		const { id } = req.params;
		const item = await MediaItem.findOne({ _id: id, user: req.user._id, isActive: false });
		
		if (!item) return res.status(404).json({ message: 'Media item not found' });
		
		item.isActive = true;
		item.deletedAt = undefined;
		await item.save();
		
		res.json({ message: 'Media item restored successfully', item });
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

// Get deleted items (for admin/restore purposes)
exports.getDeleted = async (req, res) => {
	try {
		const items = await MediaItem.find({ 
			user: req.user._id, 
			isActive: false 
		}).sort({ deletedAt: -1 });
		
		res.json(items);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

// Download selected media items as ZIP
exports.zipSelected = async (req, res) => {
	try {
		const { ids } = req.body;
		
		if (!Array.isArray(ids) || ids.length === 0) {
			return res.status(400).json({ message: 'No IDs provided' });
		}
		
		const items = await MediaItem.find({ 
			_id: { $in: ids }, 
			user: req.user._id, 
			isActive: true 
		});
		
		if (items.length === 0) {
			return res.status(404).json({ message: 'No items found' });
		}
		
		res.setHeader('Content-Type', 'application/zip');
		res.setHeader('Content-Disposition', `attachment; filename="media-${Date.now()}.zip"`);
		
		const archive = archiver('zip', { zlib: { level: 9 } });
		
		archive.on('error', err => {
			console.error('Archive error:', err);
			res.status(500).end();
		});
		
		archive.pipe(res);
		
		for (const item of items) {
			const filePath = path.join(UPLOAD_DIR, item.filename);
			if (fs.existsSync(filePath)) {
				archive.file(filePath, { name: item.originalName });
			}
		}
		
		await archive.finalize();
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

// Get media statistics
exports.getStats = async (req, res) => {
	try {
		const stats = await MediaItem.aggregate([
			{ $match: { user: req.user._id, isActive: true } },
			{
				$group: {
					_id: null,
					totalItems: { $sum: 1 },
					totalSize: { $sum: '$size' },
					avgSize: { $avg: '$size' },
					categories: { $addToSet: '$category' },
					tags: { $addToSet: '$tags' }
				}
			}
		]);
		
		const categoryStats = await MediaItem.aggregate([
			{ $match: { user: req.user._id, isActive: true } },
			{
				$group: {
					_id: '$category',
					count: { $sum: 1 },
					totalSize: { $sum: '$size' }
				}
			},
			{ $sort: { count: -1 } }
		]);
		
		res.json({
			overview: stats[0] || { totalItems: 0, totalSize: 0, avgSize: 0, categories: [], tags: [] },
			categories: categoryStats
		});
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
}; 