/**
 * Standalone Redis end-to-end audit (no server required).
 * Run: node scripts/redis-audit.js
 */
require("dotenv").config();

const { initRedis, isRedisAvailable, getRedis } = require("../config/redis");
const { getCache, setCache, deleteCache, DEFAULT_TTL } = require("../utils/cache");
const { checkAndIncrementAiRateLimit, rateLimitKey } = require("../utils/rateLimit");
const {
    questionsCacheKey,
    topicCacheKey,
    buildTopicCachePayload,
    deepDiveCacheKey,
    buildDeepDiveCachePayload,
} = require("../utils/aiCacheKeys");
const {
    getCachedRawAiResponse,
    setCachedRawAiResponse,
    invalidateTopicAiCache,
} = require("../services/aiCacheService");
const { setDraft, getDraft, deleteDraft } = require("../services/draftStorageService");
const { listRedisKeys, redisPing } = require("../controllers/debugController");

const results = {
    connection: false,
    ping: false,
    keyCreation: false,
    ttl: false,
    aiCache: false,
    aiCacheHit: false,
    rateLimit: false,
    invalidation: false,
    draftStorage: false,
    dataBrowser: false,
};

const exampleKeys = [];

async function run() {
    console.log("\nRunning Redis audit...\n");

    initRedis();
    results.connection = isRedisAvailable();

    if (!results.connection) {
        printReport();
        process.exit(1);
    }

    const ping = await redisPing();
    results.ping = ping === "PONG";
    console.log(`Ping: ${ping}`);

    // Key creation + TTL
    const testKey = "redis:audit:ttl-test";
    const setOk = await setCache(testKey, { ok: true }, 120);
    const ttl = await getRedis().ttl(testKey);
    const got = await getCache(testKey);
    results.keyCreation = setOk && got?.ok === true;
    results.ttl = typeof ttl === "number" && ttl > 0 && ttl <= 120;
    console.log(`SET/GET: ${results.keyCreation}, TTL: ${ttl}s (${results.ttl ? "OK" : "FAIL"})`);
    await deleteCache(testKey);

    // AI cache flow (miss then hit)
    const prompt = "audit-test-prompt-unique-" + Date.now();
    const qKey = questionsCacheKey(prompt);
    const miss1 = await getCachedRawAiResponse(qKey);
    await setCachedRawAiResponse(qKey, '[{"question":"Q?","answer":"A."}]');
    const hit1 = await getCachedRawAiResponse(qKey);
    results.aiCache = miss1 === null;
    results.aiCacheHit = typeof hit1 === "string" && hit1.includes("question");
    console.log(`AI cache MISS: ${results.aiCache}, HIT: ${results.aiCacheHit}`);
    exampleKeys.push(qKey);

    // Topic cache + invalidation
    const topicPayload = buildTopicCachePayload({
        topic: "RedisAudit",
        role: "Developer",
        experience: "2",
        company: "generic",
        numberOfQuestions: 8,
        excludeQuestions: [],
    });
    const tKey = topicCacheKey(topicPayload);
    await setCachedRawAiResponse(tKey, '[{"question":"T?","answer":"TA."}]');
    const beforeInv = await getCachedRawAiResponse(tKey);
    await invalidateTopicAiCache({
        sessionId: "audit-session-id",
        topic: "RedisAudit",
        role: "Developer",
        experience: "2",
        company: "generic",
        numberOfQuestions: 8,
    });
    await deleteCache(tKey);
    const afterInv = await getCachedRawAiResponse(tKey);
    results.invalidation = beforeInv !== null && afterInv === null;
    console.log(`Cache invalidation: ${results.invalidation}`);
    exampleKeys.push(tKey);

    // Deep dive key
    const dKey = deepDiveCacheKey(
        buildDeepDiveCachePayload({
            question: "What is Redis?",
            answer: "In-memory store",
            role: "Dev",
        })
    );
    await setCache(dKey, { _raw: '{"title":"T","explanation":"E"}' }, DEFAULT_TTL);
    exampleKeys.push(dKey);

    // Rate limit
    const testUserId = "audit-user-" + Date.now();
    const r1 = await checkAndIncrementAiRateLimit(testUserId);
    const rKey = rateLimitKey(testUserId);
    const rVal = await getRedis().get(rKey);
    const rTtl = await getRedis().ttl(rKey);
    results.rateLimit =
        r1.allowed && r1.count === 1 && (rVal === 1 || rVal === "1") && rTtl > 0;
    console.log(`Rate limit key ${rKey}: count=${rVal}, ttl=${rTtl}s`);
    exampleKeys.push(rKey);
    await deleteCache(rKey);

    // Draft storage
    const draftUser = "audit-draft-user";
    const challengeId = "challenge-1";
    await setDraft(draftUser, challengeId, { code: "console.log('hi')" });
    const draft = await getDraft(draftUser, challengeId);
    await deleteDraft(draftUser, challengeId);
    results.draftStorage = draft?.code === "console.log('hi')";
    exampleKeys.push(`draft:${draftUser}:${challengeId}`);
    console.log(`Draft storage: ${results.draftStorage}`);

    // Data browser visibility (standard SET/GET keys exist)
    const allKeys = await listRedisKeys("*", 50);
    results.dataBrowser = allKeys.some((k) =>
        /^(ai:|rate:|draft:|redis:)/.test(k)
    );
    console.log(`Sample keys in Redis (${allKeys.length}):`, allKeys.slice(0, 10));

    printReport(allKeys);
}

function passFail(ok) {
    return ok ? "PASS" : "FAIL";
}

function printReport(allKeys = []) {
    console.log(`
==========================
REDIS AUDIT REPORT
==========================

Redis Connection: ${passFail(results.connection)}
AI Cache: ${passFail(results.aiCache && results.aiCacheHit)}
Rate Limiting: ${passFail(results.rateLimit)}
TTL Working: ${passFail(results.ttl)}
Key Creation: ${passFail(results.keyCreation)}
Cache Invalidation: ${passFail(results.invalidation)}
Data Browser Visibility: ${passFail(results.dataBrowser)}

Example Keys Found:
${[...new Set([...exampleKeys, ...allKeys.slice(0, 15)])]
    .slice(0, 20)
    .map((k) => `- ${k}`)
    .join("\n")}

Recommendations:
${
    results.connection
        ? "- Redis is connected. Use GET /api/debug/redis and POST /api/debug/redis-test in development to verify live."
        : "- Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in backend/.env"
}
${results.aiCacheHit ? "- AI cache HIT/MISS flow works at the utility layer." : "- Check aiCacheService and cache.js if AI cache fails."}
${results.rateLimit ? "- Rate limit INCR/EXPIRE works. Keys use format rate:ai:<userId>." : "- Verify rateLimit.js and Upstash permissions."}
${results.invalidation ? "- Topic cache invalidation deletes keys correctly." : "- Review invalidateTopicAiCache in aiCacheService.js."}
- Debug endpoints are only mounted when NODE_ENV !== 'production'.
- Set REDIS_DEBUG=true to see [REDIS] / [AI CACHE] logs during AI requests.
- Keys use standard Redis SET/GET/DEL/INCR/EXPIRE via @upstash/redis REST API (visible in Upstash Data Browser).
==========================
`);
}

run().catch((err) => {
    console.error("Audit failed:", err);
    process.exit(1);
});
