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
                }
            }
        });

        redisClient.on('error', (err) => {
            // Suppress initial connection errors to prevent crash
            console.error('Redis Client Error (handled):', err.message);
        });

        redisClient.on('connect', () => console.log('Redis connected successfully'.green));

        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis. Server will continue without caching.'.yellow, err.message);
        // Do not throw, allow server to maximize resilience
        redisClient = null;
    }
};

const getCache = async (key) => {
    if (!redisClient?.isOpen) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error('Redis Get Error:', err);
        return null;
    }
};

const setCache = async (key, value, ttlSeconds = 3600) => {
    if (!redisClient?.isOpen) return;
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
