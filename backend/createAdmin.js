const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
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
    
    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin already exists:');
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log('\n💡 You can use these credentials or create a new admin.');
    }
    
    // Create new admin
    console.log('\n🆕 Creating new admin user...\n');
    
    const adminData = {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);
    
    // Insert admin user
    const result = await usersCollection.insertOne(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log(`   Name: ${adminData.name}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ${adminData.role}`);
    console.log(`   ID: ${result.insertedId}`);
    console.log('\n🔑 You can now login with these credentials!');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
  
}).catch((error) => {
  console.error('❌ Failed to connect to MongoDB:', error.message);
}).finally(() => {
  mongoose.connection.close();
  console.log('\n🔌 Disconnected from MongoDB');
});
