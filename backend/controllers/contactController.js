const ContactMessage = require('../models/contactMessageModel');

// POST /api/contact - submit new message
exports.createMessage = async (req, res) => {
	try {
		const { subject, message, name, email } = req.body;
		if (!subject || !message) {
			return res.status(400).json({ message: 'Subject and message are required' });
		}
		if (subject.length > 200) return res.status(400).json({ message: 'Subject too long (max 200)' });
		if (message.length > 2000) return res.status(400).json({ message: 'Message too long (max 2000)' });
		const doc = await ContactMessage.create({
			user: req.user._id,
			name: (name || req.user.name).trim(),
			email: (email || req.user.email).trim(),
			subject: subject.trim(),
			message: message.trim()
		});
		res.status(201).json(doc);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// GET /api/contact/mymessages - get user's messages
exports.getMyMessages = async (req, res) => {
	try {
		const docs = await ContactMessage.find({ user: req.user._id }).sort({ createdAt: -1 });
		res.status(200).json(docs);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// PUT /api/contact/:id - update own message
exports.updateMyMessage = async (req, res) => {
	try {
		const { id } = req.params;
		const { subject, message } = req.body;
		const doc = await ContactMessage.findOne({ _id: id, user: req.user._id });
		if (!doc) return res.status(404).json({ message: 'Message not found' });
		if (subject !== undefined) {
			if (subject.length > 200) return res.status(400).json({ message: 'Subject too long (max 200)' });
			doc.subject = subject.trim();
		}
		if (message !== undefined) {
			if (message.length > 2000) return res.status(400).json({ message: 'Message too long (max 2000)' });
			doc.message = message.trim();
		}
		await doc.save();
		res.status(200).json(doc);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// DELETE /api/contact/:id - delete own message
exports.deleteMyMessage = async (req, res) => {
	try {
		const { id } = req.params;
		const doc = await ContactMessage.findOneAndDelete({ _id: id, user: req.user._id });
		if (!doc) return res.status(404).json({ message: 'Message not found' });
		res.status(200).json({ message: 'Deleted' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// ADMIN: GET /api/admin/contact - list all messages
exports.getAllMessages = async (req, res) => {
	try {
		const docs = await ContactMessage.find({}).sort({ createdAt: -1 }).populate('user', 'name email role');
		res.status(200).json(docs);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// ADMIN: DELETE /api/admin/contact/:id - delete any message
exports.adminDeleteMessage = async (req, res) => {
	try {
		const { id } = req.params;
		const doc = await ContactMessage.findByIdAndDelete(id);
		if (!doc) return res.status(404).json({ message: 'Message not found' });
		res.status(200).json({ message: 'Deleted' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
}; 