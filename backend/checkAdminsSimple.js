const mongoose = require('mongoose');

// Simple connection string - adjust this to match your MongoDB setup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/media-gallery';

console.log('🔍 Connecting to MongoDB...');
console.log('📡 URI:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ Connected to MongoDB successfully!\n');
  
  try {
    // Get the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Find all admins
    const admins = await usersCollection.find({ role: 'admin' }).toArray();
    
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
    const totalUsers = await usersCollection.countDocuments();
    console.log(`📊 Total users in system: ${totalUsers}`);
    
    if (totalUsers === 0) {
      console.log('\n🆕 No users exist. Register normally to become the first admin.');
    } else {
      console.log('\n💡 If you can\'t remember admin credentials:');
      console.log('   1. Check the emails above');
      console.log('   2. Try common passwords (password, 123456, etc.)');
      console.log('   3. Check your email for registration confirmations');
      console.log('   4. Try registering a new user (will become admin if no admins exist)');
    }
    
  } catch (error) {
    console.error('❌ Error reading database:', error.message);
  }
  
}).catch((error) => {
  console.error('❌ Failed to connect to MongoDB:', error.message);
  console.log('\n💡 Common solutions:');
  console.log('   1. Make sure MongoDB is running');
  console.log('   2. Check your connection string');
  console.log('   3. Verify database name is correct');
}).finally(() => {
  mongoose.connection.close();
  console.log('\n🔌 Disconnected from MongoDB');
});
