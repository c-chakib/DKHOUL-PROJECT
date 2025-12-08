const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const DB_LOCAL = 'mongodb://localhost:27017/dkhoul';
// Priority: MONGODB_URI (Server standard) > DATABASE (Old standard) > Local
const DB = process.env.MONGODB_URI || (process.env.DATABASE ? process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
) : DB_LOCAL);

console.log('Using Database:', DB);

mongoose
    .connect(DB)
    .then(() => console.log('DB connection successful!'))
    .catch((err) => console.error('DB connection error:', err));

const createAdmins = async () => {
    try {
        // 1. Create Super Admin
        const superAdminEmail = 'superadmin@dkhoul.ma';
        await User.deleteOne({ email: superAdminEmail }); // FORCE DELETE to ensure password reset

        await User.create({
            name: 'Super Admin',
            email: superAdminEmail,
            password: 'password123',
            passwordConfirm: 'password123',
            role: 'admin',
            photo: 'https://ui-avatars.com/api/?name=Super+Admin&background=0D8ABC&color=fff'
        });
        console.log('✅ Super Admin created (reset): superadmin@dkhoul.ma / password123');

        // 2. Create Regular Admin (Requested by User)
        const adminEmail = 'admin@dkhoul.ma';
        await User.deleteOne({ email: adminEmail });

        await User.create({
            name: 'Regular Admin',
            email: adminEmail,
            password: 'password123',
            passwordConfirm: 'password123',
            role: 'admin',
            photo: 'https://ui-avatars.com/api/?name=Regular+Admin&background=555&color=fff'
        });
        console.log('✅ Regular Admin created: admin@dkhoul.ma / password123');

        // 3. Create Host
        const hostEmail = 'host@dkhoul.ma';
        await User.deleteOne({ email: hostEmail });

        await User.create({
            name: 'Test Host',
            email: hostEmail,
            password: 'password123',
            passwordConfirm: 'password123',
            role: 'host',
            photo: 'https://ui-avatars.com/api/?name=Test+Host&background=f0c419&color=fff'
        });
        console.log('✅ Test Host created (reset): host@dkhoul.ma / password123');

    } catch (err) {
        console.error('❌ Error creating admins:', err);
    } finally {
        setTimeout(() => {
            process.exit();
        }, 1000);
    }
};

createAdmins();
