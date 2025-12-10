const mongoose = require('mongoose');
const User = require('../src/models/User');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const verify = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dkhoul_test';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to DB');

        // Cleanup
        await User.deleteMany({ email: 'policy@test.com' });

        // Test 1: Weak Password
        try {
            await User.create({
                name: 'Weak User',
                email: 'policy@test.com',
                password: 'weak',
                passwordConfirm: 'weak'
            });
            console.error('❌ FAILED: Weak password was accepted!');
        } catch (err) {
            if (err.errors.password && err.errors.password.message.includes('12 caractères')) {
                console.log('✅ SUCCESS: Weak password rejected correctly.');
            } else {
                console.error('❌ UNEXPECTED ERROR (Weak):', err.message);
            }
        }

        // Test 2: Strong Password
        try {
            await User.create({
                name: 'Strong User',
                email: 'policy@test.com',
                password: 'Password123!',
                passwordConfirm: 'Password123!'
            });
            console.log('✅ SUCCESS: Strong password accepted.');
        } catch (err) {
            console.error('❌ FAILED: Strong password rejected:', err.message);
        }

        process.exit(0);
    } catch (err) {
        console.error('Script Error:', err);
        process.exit(1);
    }
};

verify();
