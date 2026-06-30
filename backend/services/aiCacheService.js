const { getCache, setCache, deleteCache, DEFAULT_TTL } = require("../utils/cache");
const {
    topicCacheKey,
    topicRefKey,
    buildTopicCachePayload,
} = require("../utils/aiCacheKeys");
const {
    logAiCacheInvalidate,
} = require("../utils/redisDebug");

async function getCachedRawAiResponse(cacheKey) {
    const cached = await getCache(cacheKey);
    if (!cached) return null;

    if (typeof cached === "object" && typeof cached._raw === "string") {
        return cached._raw;
    }

    if (typeof cached === "string") {
        return cached;
    }

    return null;
}

async function setCachedRawAiResponse(cacheKey, rawText) {
    return setCache(cacheKey, { _raw: rawText }, DEFAULT_TTL);
}

async function registerTopicCacheRef(sessionId, topic, cacheKey) {
    if (!sessionId || !topic) return;
    const refKey = topicRefKey(sessionId, topic);
    logAiCacheInvalidate(`register ref ${refKey} -> ${cacheKey}`);
    await setCache(refKey, cacheKey, DEFAULT_TTL);
}

async function invalidateTopicAiCache({
    sessionId,
    topic,
    role,
    experience,
    company,
    customCompanyName,
    numberOfQuestions,
}) {
    logAiCacheInvalidate(
        `sessionId=${sessionId || "none"} topic=${topic || "none"}`
    );

    if (sessionId && topic) {
        const ref = topicRefKey(sessionId, topic);
        const pointedKey = await getCache(ref);

        if (typeof pointedKey === "string" && pointedKey) {
            await deleteCache(pointedKey);
        }

        await deleteCache(ref);
    }

    if (topic && role && experience) {
        const counts = new Set([numberOfQuestions, 8, 10].filter(Boolean));

        for (const count of counts) {
            const payload = buildTopicCachePayload({
                topic,
                role,
                experience,
                company,
                customCompanyName,
                numberOfQuestions: count,
                excludeQuestions: [],
            });
            await deleteCache(topicCacheKey(payload));
        }
    }
}

module.exports = {
    getCachedRawAiResponse,
    setCachedRawAiResponse,
    registerTopicCacheRef,
    invalidateTopicAiCache,
};
