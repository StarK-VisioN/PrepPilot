const { getCache, setCache, deleteCache, DEFAULT_TTL } = require("../utils/cache");

const KEYS = {
    dashboard: (userId) => `analytics:dashboard:${userId}`,
    roadmap: (userId) => `analytics:roadmap:${userId}`,
    recommendations: (userId) => `analytics:recommendations:${userId}`,
    topics: (userId) => `analytics:topics:${userId}`,
};

async function getCachedDashboard(userId) {
    return getCache(KEYS.dashboard(userId));
}

async function setCachedDashboard(userId, data) {
    return setCache(KEYS.dashboard(userId), data, DEFAULT_TTL);
}

async function getCachedRoadmap(userId) {
    return getCache(KEYS.roadmap(userId));
}

async function setCachedRoadmap(userId, data) {
    return setCache(KEYS.roadmap(userId), data, DEFAULT_TTL);
}

async function getCachedRecommendations(userId) {
    return getCache(KEYS.recommendations(userId));
}

async function setCachedRecommendations(userId, data) {
    return setCache(KEYS.recommendations(userId), data, DEFAULT_TTL);
}

async function getCachedTopics(userId) {
    return getCache(KEYS.topics(userId));
}

async function setCachedTopics(userId, data) {
    return setCache(KEYS.topics(userId), data, DEFAULT_TTL);
}

async function invalidateAnalyticsCache(userId) {
    if (!userId) return;
    await Promise.all([
        deleteCache(KEYS.dashboard(userId)),
        deleteCache(KEYS.roadmap(userId)),
        deleteCache(KEYS.recommendations(userId)),
        deleteCache(KEYS.topics(userId)),
    ]);
}

module.exports = {
    getCachedDashboard,
    setCachedDashboard,
    getCachedRoadmap,
    setCachedRoadmap,
    getCachedRecommendations,
    setCachedRecommendations,
    getCachedTopics,
    setCachedTopics,
    invalidateAnalyticsCache,
};
