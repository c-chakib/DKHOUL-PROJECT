const mongoose = require('mongoose');

beforeAll(async () => {
    // Connect to a test database
    const mongoUri = 'mongodb://localhost:27017/dkhoul_test';
    await mongoose.connect(mongoUri);
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
