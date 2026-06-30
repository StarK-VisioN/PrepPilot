const crypto = require("crypto");

function hashPayload(payload) {
    const normalized =
        typeof payload === "string" ? payload : JSON.stringify(payload);
    return crypto.createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

function questionsCacheKey(prompt) {
    return `ai:questions:${hashPayload(prompt)}`;
}

function buildTopicCachePayload({
    topic,
    role,
    experience,
    company,
    customCompanyName,
    numberOfQuestions,
    excludeQuestions = [],
}) {
    return {
        topic: topic.trim().toLowerCase(),
        role: role.trim(),
        experience: experience.toString().trim(),
        company: company || "generic",
        customCompanyName: customCompanyName || "",
        numberOfQuestions,
        excludeQuestions: excludeQuestions
            .map((q) => q.toLowerCase().trim())
            .filter(Boolean)
            .sort(),
    };
}

function topicCacheKey(payload) {
    return `ai:topic:${hashPayload(payload)}`;
}

function buildDeepDiveCachePayload({ question, answer, role }) {
    return {
        question: (question || "").trim(),
        answer: (answer || "").trim(),
        role: (role || "").trim(),
    };
}

function deepDiveCacheKey(payload) {
    return `ai:deepdive:${hashPayload(payload)}`;
}

function topicRefKey(sessionId, topic) {
    return `ai:topic:ref:${sessionId}:${topic.trim().toLowerCase()}`;
}

module.exports = {
    questionsCacheKey,
    buildTopicCachePayload,
    topicCacheKey,
    buildDeepDiveCachePayload,
    deepDiveCacheKey,
    topicRefKey,
};
