const mongoose = require("mongoose");
const MockInterviewSession = require("../models/MockInterviewSession");
const MockInterviewMessage = require("../models/MockInterviewMessage");
const { ROLES, PERSONALITIES } = require("../models/MockInterviewSession");
const { getUserId } = require("../utils/sessionOwnership");
const { scheduleAnalyticsRefresh } = require("../services/analyticsWorker");
const {
    saveMessage,
    getMessagesForSession,
    generateOpeningMessage,
    generateFollowUpMessage,
    generateEvaluation,
    syncSessionCache,
} = require("../services/mockInterviewAiService");
const {
    getSessionState,
    setSessionState,
    buildInitialState,
} = require("../services/mockInterviewCacheService");
const {
    checkAndIncrementDailyInterviews,
    checkAndIncrementMessageRate,
} = require("../services/mockInterviewRateLimitService");

function sanitizeMessage(doc) {
    const m = doc.toObject ? doc.toObject() : doc;
    return {
        _id: m._id,
        sender: m.sender,
        message: m.message,
        questionType: m.questionType,
        sequence: m.sequence,
        createdAt: m.createdAt,
    };
}

function sanitizeSession(doc, includeFeedback = false) {
    const s = doc.toObject ? doc.toObject() : doc;
    const base = {
        _id: s._id,
        role: s.role,
        customRole: s.customRole,
        interviewType: s.interviewType,
        difficulty: s.difficulty,
        duration: s.duration,
        personality: s.personality,
        sourceType: s.sourceType,
        status: s.status,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        questionCount: s.questionCount,
        score: s.score,
        summary: s.summary,
        currentTopic: s.currentTopic,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
    };
    if (includeFeedback) {
        base.feedback = s.feedback;
        base.jobDescription = s.jobDescription;
        base.resumeText = s.resumeText;
    }
    return base;
}

async function loadOwnedMockSession(sessionId, userId) {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        return { error: { status: 400, message: "Invalid session id" } };
    }

    const session = await MockInterviewSession.findById(sessionId);
    if (!session) {
        return { error: { status: 404, message: "Interview session not found" } };
    }

    if (session.user.toString() !== userId.toString()) {
        return { error: { status: 403, message: "Not authorized to access this session" } };
    }

    return { session };
}

const getConfig = async (req, res) => {
    res.status(200).json({
        success: true,
        roles: ROLES,
        personalities: PERSONALITIES.map((id) => ({
            id,
            label: id
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
        })),
        interviewTypes: ["Technical", "Behavioral", "Mixed"],
        difficulties: ["Beginner", "Intermediate", "Senior"],
        durations: [15, 30, 45, 60],
    });
};

const startInterview = async (req, res) => {
    try {
        const userId = getUserId(req);
        const {
            role,
            customRole,
            interviewType,
            difficulty,
            duration,
            personality = "friendly",
            sourceType = "preset",
            jobDescription = "",
            resumeText = "",
        } = req.body;

        if (!role || !ROLES.includes(role)) {
            return res.status(400).json({ success: false, message: "Valid role is required" });
        }
        if (!["Technical", "Behavioral", "Mixed"].includes(interviewType)) {
            return res.status(400).json({ success: false, message: "Valid interview type required" });
        }
        if (!["Beginner", "Intermediate", "Senior"].includes(difficulty)) {
            return res.status(400).json({ success: false, message: "Valid difficulty required" });
        }
        if (![15, 30, 45, 60].includes(Number(duration))) {
            return res.status(400).json({ success: false, message: "Duration must be 15, 30, 45, or 60" });
        }
        if (!PERSONALITIES.includes(personality)) {
            return res.status(400).json({ success: false, message: "Valid personality required" });
        }
        if (sourceType === "jd" && !jobDescription?.trim()) {
            return res.status(400).json({ success: false, message: "Job description is required" });
        }
        if (sourceType === "resume" && !resumeText?.trim()) {
            return res.status(400).json({ success: false, message: "Resume text is required" });
        }

        const dailyLimit = await checkAndIncrementDailyInterviews(userId);
        if (!dailyLimit.allowed) {
            return res.status(429).json({
                success: false,
                message: `Daily interview limit reached (${dailyLimit.limit}/day). Try again tomorrow.`,
            });
        }

        const session = await MockInterviewSession.create({
            user: userId,
            role,
            customRole: customRole || "",
            interviewType,
            difficulty,
            duration: Number(duration),
            personality,
            sourceType,
            jobDescription: sourceType === "jd" ? jobDescription : "",
            resumeText: sourceType === "resume" ? resumeText : "",
            status: "active",
            startedAt: new Date(),
            questionCount: 0,
        });

        const opening = await generateOpeningMessage(session);
        const aiMsg = await saveMessage(
            session._id,
            "ai",
            opening.text,
            opening.questionType,
            1
        );

        session.questionCount = 1;
        session.currentTopic = opening.questionType;
        await session.save();

        const messages = [aiMsg];
        await syncSessionCache(session, messages);

        res.status(201).json({
            success: true,
            session: sanitizeSession(session),
            messages: messages.map(sanitizeMessage),
            aiAvailable: opening.aiAvailable,
        });
    } catch (error) {
        console.error("startInterview error:", error);
        res.status(500).json({ success: false, message: "Failed to start interview" });
    }
};

const sendMessage = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { sessionId, message } = req.body;

        if (!sessionId || !message?.trim()) {
            return res.status(400).json({ success: false, message: "sessionId and message are required" });
        }

        const msgLimit = await checkAndIncrementMessageRate(userId);
        if (!msgLimit.allowed) {
            return res.status(429).json({
                success: false,
                message: "Too many messages. Please wait a moment before sending again.",
            });
        }

        const { session, error } = await loadOwnedMockSession(sessionId, userId);
        if (error) {
            return res.status(error.status).json({ success: false, message: error.message });
        }

        if (session.status !== "active") {
            return res.status(400).json({ success: false, message: "Interview session is not active" });
        }

        const existing = await getMessagesForSession(session._id);
        const userSeq = existing.length + 1;
        const userMsg = await saveMessage(session._id, "user", message.trim(), "followup", userSeq);

        const followUp = await generateFollowUpMessage(session, message.trim());
        const aiSeq = userSeq + 1;
        const aiMsg = await saveMessage(
            session._id,
            "ai",
            followUp.text,
            followUp.questionType,
            aiSeq
        );

        session.questionCount = (session.questionCount || 0) + 1;
        session.currentTopic = followUp.questionType;
        await session.save();

        const allMessages = [...existing, userMsg, aiMsg];
        await syncSessionCache(session, allMessages);

        res.status(200).json({
            success: true,
            messages: [sanitizeMessage(userMsg), sanitizeMessage(aiMsg)],
            session: sanitizeSession(session),
            aiAvailable: followUp.aiAvailable,
        });
    } catch (error) {
        console.error("sendMessage error:", error);
        res.status(500).json({ success: false, message: "Failed to send message" });
    }
};

const endInterview = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ success: false, message: "sessionId is required" });
        }

        const { session, error } = await loadOwnedMockSession(sessionId, userId);
        if (error) {
            return res.status(error.status).json({ success: false, message: error.message });
        }

        if (session.status === "completed") {
            return res.status(200).json({
                success: true,
                session: sanitizeSession(session, true),
                alreadyCompleted: true,
            });
        }

        const { feedback, summary } = await generateEvaluation(session);

        session.status = "completed";
        session.completedAt = new Date();
        session.feedback = feedback;
        session.summary = summary;
        session.score = feedback.overallScore;
        await session.save();

        const closingText =
            "Thank you for your time today. That concludes our interview. I'll prepare your feedback report now.";
        const existing = await getMessagesForSession(session._id);
        const closingMsg = await saveMessage(
            session._id,
            "ai",
            closingText,
            "closing",
            existing.length + 1
        );

        const allMessages = [...existing, closingMsg];
        await syncSessionCache(session, allMessages);
        scheduleAnalyticsRefresh(userId);

        res.status(200).json({
            success: true,
            session: sanitizeSession(session, true),
            feedback,
            summary,
            aiAvailable: feedback.aiAvailable !== false,
        });
    } catch (error) {
        console.error("endInterview error:", error);
        res.status(500).json({ success: false, message: "Failed to end interview" });
    }
};

const getSession = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        const { session, error } = await loadOwnedMockSession(id, userId);
        if (error) {
            return res.status(error.status).json({ success: false, message: error.message });
        }

        let messages = await getMessagesForSession(session._id);

        if (messages.length === 0) {
            const cached = await getSessionState(id);
            if (cached?.messages?.length) {
                messages = cached.messages;
            }
        }

        await syncSessionCache(session, messages);

        res.status(200).json({
            success: true,
            session: sanitizeSession(session, session.status === "completed"),
            messages: messages.map(sanitizeMessage),
        });
    } catch (error) {
        console.error("getSession error:", error);
        res.status(500).json({ success: false, message: "Failed to load session" });
    }
};

const getReport = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        const { session, error } = await loadOwnedMockSession(id, userId);
        if (error) {
            return res.status(error.status).json({ success: false, message: error.message });
        }

        const messages = await getMessagesForSession(session._id);
        const qaPairs = [];
        for (let i = 0; i < messages.length; i++) {
            if (messages[i].sender === "ai" && messages[i + 1]?.sender === "user") {
                qaPairs.push({
                    question: messages[i].message,
                    answer: messages[i + 1].message,
                    questionType: messages[i].questionType,
                });
            }
        }

        res.status(200).json({
            success: true,
            session: sanitizeSession(session, true),
            messages: messages.map(sanitizeMessage),
            qaPairs,
            report: {
                summary: session.summary,
                score: session.score,
                feedback: session.feedback,
                questionCount: session.questionCount,
                duration: session.duration,
                role: session.role,
                interviewType: session.interviewType,
                difficulty: session.difficulty,
            },
        });
    } catch (error) {
        console.error("getReport error:", error);
        res.status(500).json({ success: false, message: "Failed to load report" });
    }
};

const getHistory = async (req, res) => {
    try {
        const userId = getUserId(req);

        const sessions = await MockInterviewSession.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        const completed = sessions.filter((s) => s.status === "completed" && s.score > 0);
        const scores = completed.map((s) => s.score);
        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

        const averageScore =
            scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : null;
        const bestScore = scores.length > 0 ? Math.max(...scores) : null;

        const history = sessions.map((s) => ({
            _id: s._id,
            role: s.role,
            interviewType: s.interviewType,
            difficulty: s.difficulty,
            duration: s.duration,
            personality: s.personality,
            status: s.status,
            score: s.score,
            questionCount: s.questionCount,
            summary: s.summary,
            startedAt: s.startedAt,
            completedAt: s.completedAt,
            createdAt: s.createdAt,
        }));

        res.status(200).json({
            success: true,
            history,
            analytics: {
                totalInterviews: sessions.length,
                completedInterviews: completed.length,
                averageScore,
                bestScore,
                totalMinutes,
                improvementTrend: completed
                    .slice(0, 10)
                    .reverse()
                    .map((s) => ({ date: s.completedAt, score: s.score })),
            },
        });
    } catch (error) {
        console.error("getHistory error:", error);
        res.status(500).json({ success: false, message: "Failed to load history" });
    }
};

module.exports = {
    getConfig,
    startInterview,
    sendMessage,
    endInterview,
    getSession,
    getReport,
    getHistory,
};
