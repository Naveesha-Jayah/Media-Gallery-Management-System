const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
	try {
		let token;

		// Check for token in headers or cookies
		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
			token = req.headers.authorization.split(' ')[1];
		} else if (req.cookies && req.cookies.token) {
			token = req.cookies.token;
		}

		if (!token) {
			return res.status(401).json({ message: 'Not authorized, no token' });
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		
		// Get user from token
		const user = await User.findById(decoded.id).select('-password');
		if (!user) {
			return res.status(401).json({ message: 'Not authorized, user not found' });
		}

		// Check if user is active
		if (!user.isActive) {
			return res.status(401).json({ message: 'Account is deactivated. Please contact an administrator.' });
		}

		req.user = user;
		next();
	} catch (error) {
		console.error('Auth middleware error:', error);
		res.status(401).json({ message: 'Not authorized, token failed' });
	}
};

// Admin only routes
exports.adminOnly = (req, res, next) => {
	if (req.user && req.user.role === 'admin') {
		next();
	} else {
		res.status(403).json({ message: 'Access denied. Admin privileges required.' });
	}
};

// User or Admin routes
exports.userOrAdmin = (req, res, next) => {
	if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
		next();
	} else {
		res.status(403).json({ message: 'Access denied. User privileges required.' });
	}
};

// Specific role check
exports.requireRole = (role) => {
	return (req, res, next) => {
		if (req.user && req.user.role === role) {
			next();
		} else {
			res.status(403).json({ message: `Access denied. ${role} privileges required.` });
		}
	};
};