const mongoose = require('mongoose');

const mediaItemSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	title: { type: String, default: '' },
	description: { type: String, default: '' },
	tags: { type: [String], default: [] },
	category: { type: String, default: 'general', enum: ['general', 'photos', 'videos', 'documents', 'music', 'other'] },
	location: { type: String, default: '' },
	dateTaken: { type: Date },
	originalName: { type: String, required: true },
	filename: { type: String, required: true },
	mimeType: { type: String, required: true },
	size: { type: Number, required: true },
	dimensions: {
		width: { type: Number },
		height: { type: Number }
	},
	isShared: { type: Boolean, default: false },
	isActive: { type: Boolean, default: true },
	deletedAt: { type: Date },
	downloadCount: { type: Number, default: 0 },
	viewCount: { type: Number, default: 0 },
	rating: { type: Number, min: 1, max: 5, default: 0 },
	favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { 
	timestamps: true,
	indexes: [
		{ user: 1, isActive: 1 },
		{ user: 1, category: 1 },
		{ user: 1, tags: 1 },
		{ user: 1, createdAt: -1 },
		{ isShared: 1, isActive: 1 }
	]
});

// Virtual for file extension
mediaItemSchema.virtual('extension').get(function() {
	return this.originalName.split('.').pop().toLowerCase();
});

// Virtual for file size in human readable format
mediaItemSchema.virtual('sizeFormatted').get(function() {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (this.size === 0) return '0 Bytes';
	const i = Math.floor(Math.log(this.size) / Math.log(1024));
	return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for isImage
mediaItemSchema.virtual('isImage').get(function() {
	return this.mimeType.startsWith('image/');
});

// Virtual for isVideo
mediaItemSchema.virtual('isVideo').get(function() {
	return this.mimeType.startsWith('video/');
});

// Virtual for isAudio
mediaItemSchema.virtual('isAudio').get(function() {
	return this.mimeType.startsWith('audio/');
});

// Virtual for isDocument
mediaItemSchema.virtual('isDocument').get(function() {
	return this.mimeType.includes('pdf') || 
		   this.mimeType.includes('word') || 
		   this.mimeType.includes('excel') || 
		   this.mimeType.includes('powerpoint') ||
		   this.mimeType.includes('text/');
});

// Method to increment view count
mediaItemSchema.methods.incrementView = function() {
	this.viewCount += 1;
	return this.save();
};

// Method to increment download count
mediaItemSchema.methods.incrementDownload = function() {
	this.downloadCount += 1;
	return this.save();
};

// Method to toggle favorite
mediaItemSchema.methods.toggleFavorite = function(userId) {
	const index = this.favorites.indexOf(userId);
	if (index === -1) {
		this.favorites.push(userId);
	} else {
		this.favorites.splice(index, 1);
	}
	return this.save();
};

// Pre-save middleware to set default title if empty
mediaItemSchema.pre('save', function(next) {
	if (!this.title && this.originalName) {
		this.title = this.originalName.split('.')[0];
	}
	next();
});

module.exports = mongoose.model('MediaItem', mediaItemSchema); 