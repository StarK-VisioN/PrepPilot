const { getCache, setCache, deleteCache, DEFAULT_TTL } = require("../utils/cache");
const { logDraftOperation, estimatePayloadSize } = require("../utils/redisDebug");

function draftKey(userId, challengeId) {
    return `draft:${userId}:${challengeId}`;
}

/**
 * Future use: Monaco Editor autosave (Phase 2).
 * Stores temporary draft content with 24h TTL.
 */
async function getDraft(userId, challengeId) {
    if (!userId || !challengeId) return null;
    const key = draftKey(userId, challengeId);
    logDraftOperation("GET", userId, challengeId);
    return getCache(key);
}

async function setDraft(userId, challengeId, content) {
    if (!userId || !challengeId) return false;
    const key = draftKey(userId, challengeId);
    logDraftOperation(
        `SET (size: ${estimatePayloadSize(content)}B)`,
        userId,
        challengeId
    );
    return setCache(key, content, DEFAULT_TTL);
}

async function deleteDraft(userId, challengeId) {
    if (!userId || !challengeId) return false;
    logDraftOperation("DELETE", userId, challengeId);
    return deleteCache(draftKey(userId, challengeId));
}

module.exports = {
    draftKey,
    getDraft,
    setDraft,
    deleteDraft,
};
