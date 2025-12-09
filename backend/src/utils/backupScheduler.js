const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const colors = require('colors');

const backupDB = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log('Backup skipped: Database not connected.'.yellow);
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '../../backups', `backup-${timestamp}`);

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        console.log(`📦 Starting Database Backup to ${backupDir}...`.blue);

        const collections = await mongoose.connection.db.collections();

        for (let collection of collections) {
            try {
                const data = await collection.find({}).toArray();
                const filePath = path.join(backupDir, `${collection.collectionName}.json`);
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                console.log(`   - Backed up ${collection.collectionName}: ${data.length} docs`);
            } catch (colErr) {
                console.error(`   ! Failed to backup collection ${collection.collectionName}:`, colErr.message);
            }
        }

        console.log('✅ Backup completed successfully.'.green);
    } catch (err) {
        console.error('❌ Backup Failed:', err);
    }
};

const initBackupScheduler = () => {
    // Schedule every 12 hours: '0 */12 * * *'
    // For testing/demo, we can also run it immediately on startup slightly later?
    // No, just schedule.
    cron.schedule('0 */12 * * *', () => {
        console.log('⏰ Running Scheduled Backup (12h)...'.cyan);
        backupDB();
    });

    console.log('🗓️  Backup Scheduler Initialized (Every 12 hours)'.green);
};

module.exports = { initBackupScheduler, backupDB };
