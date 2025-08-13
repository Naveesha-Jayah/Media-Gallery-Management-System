require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('./config/passport');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.ORIGIN || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Authorization']
}));
app.use(passport.initialize());

// Provide sensible defaults for local development
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/media_gallery';
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'devsecret';
}

// Database connection
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/user', require('./routes/user'));
app.use('/api', require('./routes/contactRoutes'));
app.use('/api', require('./routes/mediaRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));