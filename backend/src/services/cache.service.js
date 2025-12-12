const redis = require('redis');

let redisClient;

const initRedis = async () => {
    try {
        redisClient = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 5) {
                        console.error('Redis: Max retries exhausted. Caching disabled.');
                        return new Error('Max retries exhausted');
                    }
                    return Math.min(retries * 50, 1000);
                },
                connectTimeout: 5000 // 5s timeout
            },
            // Prevent command queuing when disconnected to avoid blocking requests
            disableOfflineQueue: true
        });

        redisClient.on('error', (err) => {
            // Only log if it's not a known reconnection causing spam
            // console.error('Redis Client Error:', err.message);
        });

        redisClient.on('connect', () => console.log('Redis connected successfully'.green));

        // Don't await connection here to allow server start. Connect in background.
        redisClient.connect().catch(err => {
            console.error('Initial Redis connection failed'.yellow);
        });

    } catch (err) {
        console.error('Failed to initialize Redis client'.yellow, err.message);
        redisClient = null;
    }
};

const getCache = async (key) => {
    // CRITICAL: Check isReady to ensure we don't wait on queued commands during downtime
    if (!redisClient || !redisClient.isReady) return null;

    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        // Fallback silently to DB
        return null;
    }
};

const setCache = async (key, value, ttlSeconds = 3600) => {
    if (!redisClient || !redisClient.isReady) return;
    try {
        await redisClient.set(key, JSON.stringify(value), {
            EX: ttlSeconds
        });

    } catch (err) {
        console.error('Redis Set Error:', err);
    }
};

const clearCache = async (keyPattern) => {
    if (!redisClient?.isOpen) return;
    // Basic implementation for single key removal. 
    // Ideally use SCAN for patterns but keep it simple for now.
    try {
        await redisClient.del(keyPattern);
    } catch (err) {
        console.error('Redis Del Error:', err);
    }
}

module.exports = {
    initRedis,
    getCache,
    setCache,
    clearCache,
    redisClient
};
