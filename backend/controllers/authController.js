const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Check if this is the first user (make them admin)
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with appropriate role
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: isFirstUser ? 'admin' : 'user', // First user becomes admin
      isVerified: true,
      isActive: true
    });

    // Generate token on successful registration
    const token = generateToken(user._id);

    res.status(201).json({ 
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register new admin (bypasses first-user logic)
exports.adminRegister = async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;
    
    // Verify admin code
    if (adminCode !== 'ADMIN2024') {
      return res.status(403).json({ message: 'Invalid admin code' });
    }
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user directly
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin', // Always admin
      isVerified: true,
      isActive: true
    });

    // Generate token on successful registration
    const token = generateToken(user._id);

    res.status(201).json({ 
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated. Please contact an administrator.' });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Promote user to admin (admin only)
exports.promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if current user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can promote users' });
    }

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    user.role = 'admin';
    await user.save();

    res.json({ 
      message: 'User promoted to admin successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Demote admin to user (admin only)
exports.demoteToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if current user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can demote users' });
    }

    // Prevent self-demotion
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'You cannot demote yourself' });
    }

    // Find user to demote
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(400).json({ message: 'User is not an admin' });
    }

    // Check if this would be the last admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount <= 1) {
      return res.status(400).json({ message: 'Cannot demote the last admin. At least one admin must remain in the system.' });
    }

    user.role = 'user';
    await user.save();

    res.json({ 
      message: 'Admin demoted to user successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Google OAuth
exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
});

// Google OAuth callback
exports.googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect((process.env.ORIGIN || 'http://localhost:3000') + '/login?error=oauth_failed');
    }
    const token = generateToken(user._id);
    const origin = process.env.ORIGIN || 'http://localhost:3000';
    return res.redirect(`${origin}/auth/success?token=${token}`);
  })(req, res, next);
};

// Logout user
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};