const { Redis } = require("@upstash/redis");
const {
    logRedisConnectionSuccess,
    logRedisConnectionFailure,
    logRedisFallback,
} = require("../utils/redisDebug");

let redis = null;
let redisEnabled = false;

function initRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        logRedisFallback(
            "UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — cache/rate limit disabled"
        );
        console.warn(
            "Redis: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — cache/rate limit disabled"
        );
        return null;
    }

    try {
        redis = new Redis({ url, token });
        redisEnabled = true;
        logRedisConnectionSuccess();
        console.log("Redis: Upstash client initialized");
        return redis;
    } catch (error) {
        logRedisConnectionFailure(error.message);
        console.warn("Redis: failed to initialize —", error.message);
        redis = null;
        redisEnabled = false;
        return null;
    }
}

function getRedis() {
    return redisEnabled ? redis : null;
}

function isRedisAvailable() {
    return redisEnabled && redis !== null;
}

module.exports = {
    initRedis,
    getRedis,
    isRedisAvailable,
};
