const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/media-gallery', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkAdmins() {
  try {
    console.log('🔍 Checking database for admins...\n');
    
    // Find all admins
    const admins = await User.find({ role: 'admin' }).sort({ createdAt: 1 });
    
    if (admins.length > 0) {
      console.log(`✅ Found ${admins.length} admin(s):\n`);
      admins.forEach((admin, index) => {
        console.log(`Admin ${index + 1}:`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log(`   Active: ${admin.isActive ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('❌ No admins found in the database!\n');
    }
    
    // Check total users
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in system: ${totalUsers}`);
    
    if (totalUsers === 0) {
      console.log('\n🆕 No users exist. Register normally to become the first admin.');
    } else {
      console.log('\n💡 If you can\'t remember admin credentials:');
      console.log('   1. Check the emails above');
      console.log('   2. Try common passwords (password, 123456, etc.)');
      console.log('   3. Use the resetAdmin.js script to create a new admin');
      console.log('   4. Check your email for registration confirmations');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
checkAdmins();
