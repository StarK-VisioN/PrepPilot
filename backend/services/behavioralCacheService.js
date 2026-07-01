const { getCache, setCache, deleteCache, DEFAULT_TTL } = require("../utils/cache");

const KEYS = {
    allQuestions: "behavioral:questions",
    question: (id) => `behavioral:question:${id}`,
    userStats: (userId) => `behavioral:stats:${userId}`,
};

async function getCachedQuestions() {
    return getCache(KEYS.allQuestions);
}

async function setCachedQuestions(questions) {
    return setCache(KEYS.allQuestions, questions, DEFAULT_TTL);
}

async function invalidateQuestionsCache() {
    return deleteCache(KEYS.allQuestions);
}

async function getCachedQuestion(id) {
    return getCache(KEYS.question(id));
}

async function setCachedQuestion(id, question) {
    return setCache(KEYS.question(id), question, DEFAULT_TTL);
}

async function invalidateQuestionCache(id) {
    return deleteCache(KEYS.question(id));
}

async function getCachedUserStats(userId) {
    return getCache(KEYS.userStats(userId));
}

async function setCachedUserStats(userId, stats) {
    return setCache(KEYS.userStats(userId), stats, DEFAULT_TTL);
}

async function invalidateUserStats(userId) {
    return deleteCache(KEYS.userStats(userId));
}

module.exports = {
    KEYS,
    getCachedQuestions,
    setCachedQuestions,
    invalidateQuestionsCache,
    getCachedQuestion,
    setCachedQuestion,
    invalidateQuestionCache,
    getCachedUserStats,
    setCachedUserStats,
    invalidateUserStats,
};
