const { getCache, setCache, deleteCache, DEFAULT_TTL } = require("../utils/cache");
const { logDraftOperation, estimatePayloadSize } = require("../utils/redisDebug");
const { DEFAULT_CODING_LANGUAGE } = require("../utils/codingLanguages");

function draftKey(userId, challengeId) {
    return `draft:${userId}:${challengeId}:${DEFAULT_CODING_LANGUAGE}`;
}

async function getDraft(userId, challengeId) {
    if (!userId || !challengeId) return null;
    const key = draftKey(userId, challengeId);
    logDraftOperation("GET", userId, `${challengeId}:${DEFAULT_CODING_LANGUAGE}`);
    return getCache(key);
}

async function getDraftsForChallenge(userId, challengeId) {
    if (!userId || !challengeId) {
        return { codes: {}, languages: [] };
    }

    const draft = await getDraft(userId, challengeId);
    if (!draft?.code) {
        return { codes: {}, languages: [] };
    }

    return {
        codes: { [DEFAULT_CODING_LANGUAGE]: draft.code },
        languages: [DEFAULT_CODING_LANGUAGE],
    };
}

async function setDraft(userId, challengeId, _language, content) {
    if (!userId || !challengeId) return false;

    const key = draftKey(userId, challengeId);
    const payload =
        typeof content === "string"
            ? { code: content, savedAt: new Date().toISOString() }
            : { ...content, savedAt: content.savedAt || new Date().toISOString() };

    logDraftOperation(
        `SET (size: ${estimatePayloadSize(payload)}B)`,
        userId,
        `${challengeId}:${DEFAULT_CODING_LANGUAGE}`
    );
    return setCache(key, payload, DEFAULT_TTL);
}

async function deleteDraft(userId, challengeId) {
    if (!userId || !challengeId) return false;
    logDraftOperation("DELETE", userId, `${challengeId}:${DEFAULT_CODING_LANGUAGE}`);
    return deleteCache(draftKey(userId, challengeId));
}

module.exports = {
    draftKey,
    getDraft,
    getDraftsForChallenge,
    setDraft,
    deleteDraft,
};
