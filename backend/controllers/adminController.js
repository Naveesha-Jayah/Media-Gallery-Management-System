const User = require('../models/userModel');

exports.listUsers = async (req, res) => {
	try {
		const users = await User.find({}).select('-password').sort({ createdAt: -1 });
		res.json(users);
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

exports.updateUser = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, email, role, isActive } = req.body;
		const user = await User.findById(id);
		if (!user) return res.status(404).json({ message: 'User not found' });
		if (name !== undefined) user.name = name;
		if (email !== undefined) user.email = email;
		if (role !== undefined) user.role = role;
		if (isActive !== undefined) user.isActive = isActive;
		await user.save();
		res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
};

exports.softDeleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		if (!user) return res.status(404).json({ message: 'User not found' });
		user.isActive = false;
		await user.save();
		res.json({ message: 'Deactivated' });
	} catch (e) {
		res.status(500).json({ message: e.message });
	}
}; 