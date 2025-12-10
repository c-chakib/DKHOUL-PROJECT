const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables for tests
dotenv.config({ path: './.env' });

beforeAll(async () => {
    // CRITICAL: Ensure we are in TEST environment
    if (process.env.NODE_ENV !== 'test') {
        console.error('💥 FATAL: Tests must be run with NODE_ENV=test to protect the main database.');
        process.exit(1);
    }

    // Force usage of TEST database
    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dkhoul_test';

    // Set JWT_SECRET if missing (mock)
    if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-secret-key-123';

    // Increase timeout for slow bcrypt hashing
    jest.setTimeout(30000);

    // Force the database name explicitly to avoid URI parsing issues
    await mongoose.connect(mongoUri, { dbName: 'dkhoul_test' })
        .then(() => console.log(`✅ Test DB Connected to 'dkhoul_test' via: ${mongoUri}`))
        .catch(err => {
            console.error('Test DB Connection Failed', err);
            process.exit(1);
        });
});

afterEach(async () => {
    // CRITICAL: Only wipe if we are SURE it is a test environment
    if (process.env.NODE_ENV === 'test') {
        if (mongoose.connection.db) {
            const dbName = mongoose.connection.db.databaseName;
            if (dbName === 'dkhoul_test') {
                const collections = await mongoose.connection.db.collections();
                for (let collection of collections) {
                    await collection.deleteMany({});
                }
            } else {
                console.error(`🛑 PREVENTED WIPE: Connected to ${dbName} instead of dkhoul_test!`);
            }
        }
    }
});

afterAll(async () => {
    // Disconnect after all tests
    await mongoose.connection.close();
});
