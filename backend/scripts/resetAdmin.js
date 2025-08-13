const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/media-gallery', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function resetAdmin() {
  try {
    console.log('🔍 Checking for existing admins...');
    
    // Find all admins
    const admins = await User.find({ role: 'admin' }).sort({ createdAt: 1 });
    
    if (admins.length > 0) {
      console.log(`✅ Found ${admins.length} admin(s):`);
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.name} (${admin.email}) - Created: ${admin.createdAt}`);
      });
      
      console.log('\n📝 To reset password for an existing admin, use the reset password feature or update directly in database.');
    } else {
      console.log('❌ No admins found!');
    }
    
    // Check if there are any users at all
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total users in system: ${totalUsers}`);
    
    if (totalUsers === 0) {
      console.log('\n🆕 No users exist. You can register normally and become the first admin.');
    } else {
      console.log('\n🔄 Options to get admin access:');
      console.log('   1. Register a new user (will become admin if no admins exist)');
      console.log('   2. Update an existing user to admin in database');
      console.log('   3. Use this script to create a new admin');
      
      // Ask if user wants to create a new admin
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('\n❓ Do you want to create a new admin user? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          await createNewAdmin();
        }
        rl.close();
        mongoose.connection.close();
      });
      
      return; // Don't close connection yet
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close();
    }
  }
}

async function createNewAdmin() {
  try {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const askQuestion = (question) => {
      return new Promise((resolve) => {
        rl.question(question, resolve);
      });
    };
    
    const name = await askQuestion('Enter admin name: ');
    const email = await askQuestion('Enter admin email: ');
    const password = await askQuestion('Enter admin password: ');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create admin user
    const adminUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isActive: true
    });
    
    console.log('\n✅ Admin user created successfully!');
    console.log(`   Name: ${adminUser.name}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log('\n🔑 You can now login with these credentials.');
    
    rl.close();
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
}

// Run the script
resetAdmin();
