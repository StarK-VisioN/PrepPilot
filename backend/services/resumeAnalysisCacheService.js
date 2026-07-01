const { getCache, setCache, deleteCache, DEFAULT_TTL } = require("../utils/cache");

const resumeAnalysisKey = (userId) => `resume:analysis:${userId}`;

async function getCachedResumeAnalysis(userId) {
    return getCache(resumeAnalysisKey(userId));
}

async function setCachedResumeAnalysis(userId, data) {
    return setCache(resumeAnalysisKey(userId), data, DEFAULT_TTL);
}

async function invalidateResumeAnalysisCache(userId) {
    if (!userId) return;
    await deleteCache(resumeAnalysisKey(userId));
}

module.exports = {
    getCachedResumeAnalysis,
    setCachedResumeAnalysis,
    invalidateResumeAnalysisCache,
};
