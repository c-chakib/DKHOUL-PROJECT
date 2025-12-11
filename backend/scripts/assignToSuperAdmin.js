const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../src/models/User');
const Service = require('../src/models/Service');

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

const assignToSuperAdmin = async () => {
    try {
        await connectDB();

        const superAdminEmail = 'superadmin@dkhoul.ma';
        const superAdmin = await User.findOne({ email: superAdminEmail });

        if (!superAdmin) {
            console.log(`Super Admin (${superAdminEmail}) not found!`.red);
            const allUsers = await User.find().select('email role');
            console.log('Available users:', allUsers);
            process.exit(1);
        }

        console.log(`Found Super Admin: ${superAdmin.name} (${superAdmin._id})`.green);

        const result = await Service.updateMany({}, {
            $set: { host: superAdmin._id }
        });

        console.log(`Updated ${result.modifiedCount} services to be owned by Super Admin.`.green.bold);
        console.log('Since Service uses Ref("User"), any name change on the Super Admin user will automatically be reflected in these services.'.cyan);

        process.exit();

    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

assignToSuperAdmin();
