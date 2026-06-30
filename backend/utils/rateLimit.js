const { getRedis, isRedisAvailable } = require("../config/redis");
const {
    logRedisFallback,
    logRateLimitCheck,
    logRateLimitIncrement,
    logRateLimitExceeded,
} = require("./redisDebug");

const RATE_LIMIT_TTL = 86400; // 24 hours

function getAiDailyLimit() {
    const parsed = parseInt(process.env.AI_DAILY_LIMIT || "20", 10);
    return Number.isNaN(parsed) || parsed < 1 ? 20 : parsed;
}

function rateLimitKey(userId) {
    return `rate:ai:${userId}`;
}

/**
 * Increments per-user AI usage counter. Returns { allowed, count, limit }.
 * On Redis failure, allows the request (fail-open).
 */
async function checkAndIncrementAiRateLimit(userId) {
    const limit = getAiDailyLimit();

    if (!userId) {
        return { allowed: true, count: 0, limit };
    }

    if (!isRedisAvailable()) {
        logRedisFallback("rate limit skipped — Redis unavailable");
        return { allowed: true, count: 0, limit };
    }

    const key = rateLimitKey(userId);
    logRateLimitCheck(userId, limit);

    try {
        const count = await getRedis().incr(key);

        if (count === 1) {
            await getRedis().expire(key, RATE_LIMIT_TTL);
        }

        logRateLimitIncrement(userId, count, limit);

        if (count > limit) {
            logRateLimitExceeded(userId, count, limit);
            return { allowed: false, count, limit };
        }

        return { allowed: true, count, limit };
    } catch (error) {
        logRedisFallback(`rate limit increment failed — ${error.message}`);
        console.warn("Redis rate limit check failed:", error.message);
        return { allowed: true, count: 0, limit };
    }
}

module.exports = {
    checkAndIncrementAiRateLimit,
    getAiDailyLimit,
    rateLimitKey,
    RATE_LIMIT_TTL,
};
