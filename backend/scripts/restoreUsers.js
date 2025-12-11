const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../src/models/User');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: './.env' });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'dkhoul'
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red);
        process.exit(1);
    }
};

const restoreUsers = async () => {
    try {
        await connectDB();

        const backupPath = path.join(__dirname, '../backups/backup-2025-12-11T11-00-00-171Z/users.json');
        const userData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

        console.log(`Found ${userData.length} users in backup. Restoring...`.yellow);

        // We use insertMany with ordered: false to skip duplicates if any (though we deleted them likely)
        // Or we can just create them. Since we want to keep the same _id, we must include it.

        // Check if users exist first to avoid duplicate key error if seeder didn't delete them (it did delete them)
        const currentCount = await User.countDocuments();
        if (currentCount > 0) {
            console.log(`Warning: Found ${currentCount} existing users. Deleting them to restore backup completely...`.red);
            await User.deleteMany();
        }

        // Use collection.insertMany to bypass Mongoose validation (since passwords are already hashed)
        await User.collection.insertMany(userData.map(user => {
            // Convert string dates back to Date objects if needed, though Mongo might handle it
            if (user.createdAt) user.createdAt = new Date(user.createdAt);
            if (user._id) user._id = new mongoose.Types.ObjectId(user._id);
            return user;
        }));

        console.log(`✅ Successfully restored ${userData.length} users!`.green.bold);
        process.exit();

    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

restoreUsers();
