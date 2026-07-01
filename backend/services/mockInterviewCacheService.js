const { getCache, setCache, deleteCache, DEFAULT_TTL } = require("../utils/cache");

const SESSION_KEY = (sessionId) => `mockInterview:session:${sessionId}`;

async function getSessionState(sessionId) {
    return getCache(SESSION_KEY(sessionId));
}

async function setSessionState(sessionId, state) {
    return setCache(SESSION_KEY(sessionId), state, DEFAULT_TTL);
}

async function deleteSessionState(sessionId) {
    return deleteCache(SESSION_KEY(sessionId));
}

function buildInitialState(session, messages = []) {
    return {
        sessionId: session._id.toString(),
        userId: session.user.toString(),
        role: session.role,
        interviewType: session.interviewType,
        difficulty: session.difficulty,
        duration: session.duration,
        personality: session.personality,
        questionCount: session.questionCount || 0,
        currentTopic: session.currentTopic || "",
        startedAt: session.startedAt?.toISOString() || new Date().toISOString(),
        messages: messages.map((m) => ({
            sender: m.sender,
            message: m.message,
            questionType: m.questionType,
            sequence: m.sequence,
            createdAt: m.createdAt,
        })),
    };
}

module.exports = {
    getSessionState,
    setSessionState,
    deleteSessionState,
    buildInitialState,
};
