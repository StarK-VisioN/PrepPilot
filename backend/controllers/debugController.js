const { getRedis, isRedisAvailable } = require("../config/redis");
const { getCache, setCache } = require("../utils/cache");
const { isRedisDebugEnabled } = require("../utils/redisDebug");

const TEST_KEY = "redis:test";
const TEST_TTL = 60;

function logRedisTest(message) {
    if (isRedisDebugEnabled()) {
        console.log(`[REDIS TEST] ${message}`);
    }
}

async function redisPing() {
    if (!isRedisAvailable()) return null;
    try {
        const result = await getRedis().ping();
        return result === "PONG" ? "PONG" : String(result);
    } catch (error) {
        return null;
    }
}

async function listRedisKeys(pattern = "*", limit = 50) {
    if (!isRedisAvailable()) return [];

    try {
        const keys = await getRedis().keys(pattern);
        const list = Array.isArray(keys) ? keys : [];
        return list.slice(0, limit);
    } catch (error) {
        console.warn("Redis keys scan failed:", error.message);
        return [];
    }
}

async function countRedisKeys(pattern = "*") {
    const keys = await listRedisKeys(pattern, 10000);
    return keys.length;
}

exports.getRedisStatus = async (req, res) => {
    const enabled = isRedisAvailable();
    let connected = false;
    let ping = null;
    let sampleKeys = [];
    let totalKeys = 0;

    if (enabled) {
        ping = await redisPing();
        connected = ping === "PONG";
        sampleKeys = await listRedisKeys("*", 30);
        totalKeys = await countRedisKeys("*");
    }

    res.status(200).json({
        enabled,
        connected,
        ping: ping || "UNAVAILABLE",
        sampleKeys,
        totalKeys,
    });
};

exports.runRedisTest = async (req, res) => {
    if (!isRedisAvailable()) {
        return res.status(503).json({
            set: false,
            retrieved: false,
            value: null,
            ttl: null,
            error: "Redis is not available",
        });
    }

    const payload = {
        message: "redis working",
        timestamp: Date.now(),
    };

    const setOk = await setCache(TEST_KEY, payload, TEST_TTL);
    logRedisTest(setOk ? "SET successful" : "SET failed");

    const retrieved = await getCache(TEST_KEY);
    const retrievedOk =
        retrieved &&
        retrieved.message === payload.message &&
        retrieved.timestamp === payload.timestamp;
    logRedisTest(retrievedOk ? "GET successful" : "GET failed");

    let ttl = null;
    try {
        ttl = await getRedis().ttl(TEST_KEY);
        logRedisTest(`TTL: ${ttl} seconds`);
    } catch (error) {
        logRedisTest(`TTL check failed: ${error.message}`);
    }

    res.status(200).json({
        set: setOk,
        retrieved: retrievedOk,
        value: retrievedOk ? retrieved : null,
        ttl,
    });
};

module.exports.listRedisKeys = listRedisKeys;
module.exports.redisPing = redisPing;
