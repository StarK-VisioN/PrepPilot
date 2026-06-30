const { getRedis, isRedisAvailable } = require("../config/redis");
const {
    logRedisFallback,
    logCacheHit,
    logCacheMiss,
    logCacheSet,
    logCacheDelete,
    logCacheOperationFailed,
    estimatePayloadSize,
} = require("./redisDebug");

const DEFAULT_TTL = 86400; // 24 hours

async function getCache(key) {
    if (!isRedisAvailable()) {
        logRedisFallback(`getCache skipped — Redis unavailable (${key})`);
        return null;
    }

    try {
        const value = await getRedis().get(key);

        if (value === null || value === undefined) {
            logCacheMiss(key);
            return null;
        }

        let parsed = value;

        if (typeof value === "string") {
            try {
                parsed = JSON.parse(value);
            } catch {
                parsed = value;
            }
        }

        logCacheHit(key, estimatePayloadSize(parsed));
        return parsed;
    } catch (error) {
        logCacheOperationFailed("GET", key, error.message);
        console.warn(`Redis getCache failed for ${key}:`, error.message);
        return null;
    }
}

async function setCache(key, value, ttl = DEFAULT_TTL) {
    if (!isRedisAvailable()) {
        logRedisFallback(`setCache skipped — Redis unavailable (${key})`);
        return false;
    }

    try {
        const serialized =
            typeof value === "string" ? value : JSON.stringify(value);
        await getRedis().set(key, serialized, { ex: ttl });
        logCacheSet(key, ttl, estimatePayloadSize(value));
        return true;
    } catch (error) {
        logCacheOperationFailed("SET", key, error.message);
        console.warn(`Redis setCache failed for ${key}:`, error.message);
        return false;
    }
}

async function deleteCache(key) {
    if (!isRedisAvailable()) {
        logRedisFallback(`deleteCache skipped — Redis unavailable (${key})`);
        return false;
    }

    try {
        await getRedis().del(key);
        logCacheDelete(key);
        return true;
    } catch (error) {
        logCacheOperationFailed("DELETE", key, error.message);
        console.warn(`Redis deleteCache failed for ${key}:`, error.message);
        return false;
    }
}

module.exports = {
    getCache,
    setCache,
    deleteCache,
    DEFAULT_TTL,
};
