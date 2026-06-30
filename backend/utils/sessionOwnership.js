const Session = require("../models/Session");
const Question = require("../models/Question");

function getUserId(req) {
    return req.user?._id || req.user?.id;
}

function isSameUser(sessionUserId, userId) {
    return sessionUserId?.toString() === userId?.toString();
}

/**
 * Load a session and enforce ownership.
 * Returns { session } or { status, message } for 404 / 403.
 */
async function loadOwnedSession(sessionId, userId) {
    const session = await Session.findById(sessionId);

    if (!session) {
        return { status: 404, message: "Session not found" };
    }

    if (!isSameUser(session.user, userId)) {
        return { status: 403, message: "Not authorized to access this session" };
    }

    return { session };
}

/**
 * Load a question and verify the parent session belongs to the user.
 */
async function loadOwnedQuestion(questionId, userId) {
    const question = await Question.findById(questionId);

    if (!question) {
        return { status: 404, message: "Question not found" };
    }

    const session = await Session.findById(question.session);

    if (!session) {
        return { status: 404, message: "Session not found" };
    }

    if (!isSameUser(session.user, userId)) {
        return { status: 403, message: "Not authorized to access this question" };
    }

    return { question, session };
}

function sendOwnershipError(res, result) {
    return res.status(result.status).json({
        success: false,
        message: result.message,
    });
}

module.exports = {
    getUserId,
    loadOwnedSession,
    loadOwnedQuestion,
    sendOwnershipError,
};
