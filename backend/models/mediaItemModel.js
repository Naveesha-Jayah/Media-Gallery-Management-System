const mongoose = require('mongoose');

const mediaItemSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	title: { type: String, default: '' },
	description: { type: String, default: '' },
	tags: { type: [String], default: [] },
	originalName: { type: String, required: true },
	filename: { type: String, required: true },
	mimeType: { type: String, required: true },
	size: { type: Number, required: true },
	isShared: { type: Boolean, default: false },
	isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MediaItem', mediaItemSchema); 