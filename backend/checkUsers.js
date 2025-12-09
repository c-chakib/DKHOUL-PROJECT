require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const User = require('./src/models/User');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/dkhoul';

const checkUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const users = await User.find({}, 'name email role');

        fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
        console.log('Done writing users.json');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
