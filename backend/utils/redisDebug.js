function isRedisDebugEnabled() {
    return process.env.REDIS_DEBUG === "true";
}

function maskUserId(userId) {
    if (!userId) return "unknown";
    const id = userId.toString();
    if (id.length <= 8) return `${id.slice(0, 2)}***`;
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
}

function estimatePayloadSize(value) {
    if (value === null || value === undefined) return 0;
    if (typeof value === "string") return value.length;
    try {
        return JSON.stringify(value).length;
    } catch {
        return 0;
    }
}

function logRedis(message) {
    if (!isRedisDebugEnabled()) return;
    console.log(message);
}

function logRedisWarn(message) {
    if (!isRedisDebugEnabled()) return;
    console.warn(message);
}

function logRedisStartupSummary({ redisEnabled, upstashUrlConfigured }) {
    if (!isRedisDebugEnabled()) return;

    console.log("==================================");
    console.log(`Redis enabled: ${redisEnabled}`);
    console.log(`Redis debug mode: true`);
    console.log(`Upstash URL configured: ${upstashUrlConfigured}`);
    console.log("==================================");
}

function logRedisConnectionSuccess() {
    logRedis("[REDIS] CONNECTION SUCCESS");
}

function logRedisConnectionFailure(reason) {
    logRedisWarn(`[REDIS] CONNECTION FAILURE: ${reason}`);
}

function logRedisFallback(context) {
    logRedisWarn(`[REDIS] FALLBACK: ${context}`);
}

function logCacheHit(key, sizeBytes) {
    const sizePart = sizeBytes ? ` (size: ${sizeBytes}B)` : "";
    logRedis(`[REDIS] HIT: ${key}${sizePart}`);
}

function logCacheMiss(key) {
    logRedis(`[REDIS] MISS: ${key}`);
}

function logCacheSet(key, ttl, sizeBytes) {
    const sizePart = sizeBytes ? `, size: ${sizeBytes}B` : "";
    logRedis(`[REDIS] SET: ${key} (TTL: ${ttl}s${sizePart})`);
}

function logCacheDelete(key) {
    logRedis(`[REDIS] DELETE: ${key}`);
}

function logCacheDeleteFailed(key, reason) {
    logRedisWarn(`[REDIS] DELETE FAILED: ${key} — ${reason}`);
}

function logCacheOperationFailed(operation, key, reason) {
    logRedisWarn(`[REDIS] ${operation} FAILED: ${key} — ${reason}`);
}

function logRateLimitCheck(userId, limit) {
    logRedis(
        `[REDIS] RATE_LIMIT CHECK: userId=${maskUserId(userId)} limit=${limit}/day`
    );
}

function logRateLimitIncrement(userId, count, limit) {
    logRedis(
        `[RATE LIMIT] User ${maskUserId(userId)} -> ${count}/${limit} requests today`
    );
    logRedis(
        `[REDIS] RATE_LIMIT: userId=${maskUserId(userId)} count=${count}/${limit}`
    );
}

function logRateLimitExceeded(userId, count, limit) {
    logRedisWarn(
        `[RATE LIMIT] User ${maskUserId(userId)} -> LIMIT EXCEEDED ${count}/${limit}`
    );
}

function logAiCacheLooking(cacheKey) {
    logRedis(`[AI CACHE] Looking for cached response... key=${cacheKey}`);
}

function logAiCacheHit(cacheKey) {
    logRedis(`[AI CACHE] Cache HIT key=${cacheKey}`);
}

function logAiCacheMiss(cacheKey) {
    logRedis(`[AI CACHE] Cache MISS -> Calling Groq key=${cacheKey}`);
}

function logAiCacheSaving(cacheKey) {
    logRedis(`[AI CACHE] Saving response to Redis key=${cacheKey}`);
}

function logAiCacheSaved(cacheKey, sizeBytes) {
    const sizePart = sizeBytes ? ` (size: ${sizeBytes}B)` : "";
    logRedis(`[AI CACHE] Response cached successfully key=${cacheKey}${sizePart}`);
}

function logAiCacheInvalidate(context) {
    logRedis(`[AI CACHE] Invalidating topic cache — ${context}`);
}

function logDraftOperation(operation, userId, challengeId) {
    logRedis(
        `[REDIS] DRAFT ${operation}: draft:${maskUserId(userId)}:${challengeId}`
    );
}

module.exports = {
    isRedisDebugEnabled,
    maskUserId,
    estimatePayloadSize,
    logRedisStartupSummary,
    logRedisConnectionSuccess,
    logRedisConnectionFailure,
    logRedisFallback,
    logCacheHit,
    logCacheMiss,
    logCacheSet,
    logCacheDelete,
    logCacheDeleteFailed,
    logCacheOperationFailed,
    logRateLimitCheck,
    logRateLimitIncrement,
    logRateLimitExceeded,
    logAiCacheLooking,
    logAiCacheHit,
    logAiCacheMiss,
    logAiCacheSaving,
    logAiCacheSaved,
    logAiCacheInvalidate,
    logDraftOperation,
};
