const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables for tests
dotenv.config({ path: './.env' });

beforeAll(async () => {
    // Connect to a test database
    // Use MONGODB_URI from env if available, but ensure we use a TEST database
    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dkhoul_test';

    // If it's a real connection string, replace the db name to keep prod safe
    if (mongoUri.includes('?') && mongoUri.includes('mongodb+srv')) {
        // Naive replacement for basic SRV strings: e.g. .../production?retryWrites... -> .../dkhoul_test?retryWrites...
        mongoUri = mongoUri.replace(/\/[^/?]+(\?|$)/, '/dkhoul_test$1');
    } else if (!mongoUri.includes('dkhoul_test')) {
        // Localhost or simple string
        mongoUri = 'mongodb://localhost:27017/dkhoul_test';
    }

    // Set JWT_SECRET if missing (mock)
    if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-secret-key-123';

    // Increase timeout for slow bcrypt hashing
    jest.setTimeout(30000);

    await mongoose.connect(mongoUri)
        .then(() => console.log('Test DB Connected'))
        .catch(err => console.error('Test DB Connection Failed', err));
});

afterEach(async () => {
    // Clean up database after each test
    if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
        }
    }
});

afterAll(async () => {
    // Disconnect after all tests
    await mongoose.connection.close();
});
