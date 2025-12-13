
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Service = require('./src/models/Service');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: 'dkhoul' });
        const count = await Service.countDocuments();
        console.log(count);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.connection.close();
    }
}
check();
