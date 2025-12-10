const mongoose = require('mongoose');
require('colors');

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;
        if (process.env.NODE_ENV === 'test') {
            uri = uri.replace('dkhoul', 'dkhoul_test');
            if (!uri.includes('dkhoul_test')) uri += '_test'; // Fallback
        }
        const conn = await mongoose.connect(uri, {
            dbName: process.env.NODE_ENV === 'test' ? 'dkhoul_test' : 'dkhoul'
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red);
        process.exit(1);
    }
};

module.exports = connectDB;
