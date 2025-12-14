
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, { dbName: 'dkhoul' }).then(async () => {
    const user = await User.findOne({ email: 'verifier_v2@dkhoul.ma' });
    if (user) {
        console.log(`User found: ${user.email}, Role: ${user.role}`);
    } else {
        console.log('User not found');
    }
    process.exit();
}).catch(err => console.error(err));
