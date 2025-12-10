require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dkhoul';

const users = [
    {
        name: 'Super Admin',
        email: 'superadmin@dkhoul.ma',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        role: 'superadmin',
        isVerified: true,
        photo: 'https://ui-avatars.com/api/?name=Super+Admin&background=000&color=fff'
    },
    {
        name: 'Admin User',
        email: 'admin@dkhoul.ma',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        role: 'admin',
        isVerified: true,
        photo: 'https://ui-avatars.com/api/?name=Admin+User&background=333&color=fff'
    },
    {
        name: 'Host User',
        email: 'host@dkhoul.ma',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        role: 'host',
        isVerified: true,
        photo: 'https://ui-avatars.com/api/?name=Host+User&background=BC5627&color=fff'
    },
    {
        name: 'Tourist User',
        email: 'tourist@dkhoul.ma',
        password: 'Password123!',
        passwordConfirm: 'Password123!',
        role: 'tourist',
        isVerified: true,
        photo: 'https://ui-avatars.com/api/?name=Tourist+User&background=2ecc71&color=fff'
    }
];

const seedUsers = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI, { dbName: 'dkhoul' });
        console.log('✅ Connected.');

        // 1. Clean Users
        console.log('🧹 Wiping all users...');
        await User.deleteMany({});
        console.log('✨ Users collection cleaned.');

        // 2. Create Users
        console.log('👥 Creating user hierarchy...');
        for (const user of users) {
            await User.create(user);
            console.log(`   - Created ${user.role}: ${user.email}`);
        }

        console.log('🎉 SUCCESS: User hierarchy created successfully!');

        console.log('\n⚠️  CRITICAL REMINDER:');
        console.log('   Now run "node seedServices.js" to fix host references!');

        process.exit(0);
    } catch (err) {
        console.error('❌ ERROR:', err.message);
        process.exit(1);
    }
};

seedUsers();
