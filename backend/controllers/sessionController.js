const Session = require('../models/Session');
const Question = require('../models/Question');
const { extractSkills } = require("../utils/skillUtils");
const {
    getUserId,
    loadOwnedSession,
    sendOwnershipError,
} = require("../utils/sessionOwnership");

// @desc    Create a new session and linked questions
// @route   POST /api/sessions/create
// @access  Private
exports.createSession = async(req, res) => {
    try {
        const {
            role,
            experience,
            topicsToFocus,
            description,
            questions,
            sourceType,
            company,
            customCompanyName,
            skills,
            resumeDocumentId,
            jdDocumentId,
        } = req.body;
        const userId = req.user._id;

        const resolvedSkills =
            Array.isArray(skills) && skills.length > 0
                ? skills
                : extractSkills(topicsToFocus || "", {
                      topicsToFocus,
                      description,
                  });

        const session = await Session.create({
            user: userId,
            role,
            experience,
            topicsToFocus,
            description,
            sourceType: sourceType || "manual",
            company: company || "generic",
            customCompanyName: customCompanyName?.trim() || "",
            skills: resolvedSkills,
            resumeDocumentId: resumeDocumentId || null,
            jdDocumentId: jdDocumentId || null,
        });

        const questionDocs = await Promise.all(
            questions.map(async (q) => {
                const question = await Question.create({
                    session: session._id,
                    question: q.question,
                    answer: q.answer,
                });
                return question._id;
            })
        );

        session.questions = questionDocs;
        await session.save();

        res.status(201).json({success: true, session});
    } catch (error) {
        // console.error("Session creation error:", error);
        res.status(500).json({success: false, message: "Server Error"});
    }
};

// @desc    Get all sessions for the logged-in user
// @route   GET /api/sessions/my-sessions
// @access  Private
exports.getMySessions = async(req, res) => {
    try {
        const sessions = await Session.find({user: req.user.id})
            .sort({createdAt: -1})
            .populate("questions");
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({success: false, message: "Server Error"});
    }
};

// @desc    Get all sessions for the logged-in user
// @route   GET /api/sessions/:id
// @access  Private
exports.getSessionById = async(req, res) => {
    try {
        const userId = getUserId(req);
        const owned = await loadOwnedSession(req.params.id, userId);

        if (owned.status) {
            return sendOwnershipError(res, owned);
        }

        const session = await Session.findById(owned.session._id)
            .populate({
                path: "questions",
                options: {sort: {isPinned: -1, createdAt: 1}},
            })
            .exec();

        res.status(200).json({success: true, session});
    } catch (error) {
        res.status(500).json({success: false, message: "Server Error"});
    }
};

// @desc    Update custom skills for a session
// @route   PATCH /api/sessions/:id/custom-skills
// @access  Private
exports.updateCustomSkills = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const { customSkills } = req.body;
        const userId = req.user._id || req.user.id;

        console.log("Saving custom skills", sessionId, { customSkills, userId });

        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        if (!Array.isArray(customSkills)) {
            return res.status(400).json({ message: "customSkills must be an array" });
        }

        const normalized = [
            ...new Set(
                customSkills
                    .map((s) => (typeof s === "string" ? s.trim() : ""))
                    .filter(Boolean)
            ),
        ];

        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        if (session.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to access this session" });
        }

        session.customSkills = normalized;
        await session.save();

        console.log("Custom skills saved:", sessionId, normalized);

        res.status(200).json({ success: true, customSkills: normalized, session });
    } catch (error) {
        console.error("Update custom skills error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to save custom skills",
            error: process.env.NODE_ENV === "production" ? undefined : error.message,
        });
    }
};

// @desc    Delete cached topic questions for a skill deep dive
// @route   DELETE /api/sessions/:id/topic-questions/:topic
// @access  Private
exports.deleteTopicQuestions = async (req, res) => {
    try {
        console.log("Delete topic questions request", req.params);
        const sessionId = req.params.id;
        const topic = decodeURIComponent(req.params.topic || "").trim();
        const userId = req.user._id || req.user.id;

        if (!topic) {
            return res.status(400).json({ message: "Topic is required" });
        }

        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ success: false, message: "Session not found" });
        }

        if (session.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to access this session" });
        }

        const before = session.topicQuestionCache?.length || 0;
        session.topicQuestionCache = (session.topicQuestionCache || []).filter(
            (entry) => entry.topic.toLowerCase() !== topic.toLowerCase()
        );

        if (session.topicQuestionCache.length === before) {
            return res.status(200).json({
                success: true,
                message: "No question block found, nothing to delete",
                topic,
            });
        }

        await session.save();

        console.log("Deleted topic questions:", sessionId, topic);

        res.status(200).json({ success: true, topic });
    } catch (error) {
        console.error("Delete topic questions error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Delete a session and its questions
// @route   DELETE /api/sessions/:id
// @access  Private
exports.deleteSession = async(req, res) => {
    try {
        const userId = getUserId(req);
        const owned = await loadOwnedSession(req.params.id, userId);

        if (owned.status) {
            return sendOwnershipError(res, owned);
        }

        const session = owned.session;

        await Question.deleteMany({session: session._id});
        await session.deleteOne();
        
        res.status(200).json({message: "Session deleted successfully"});
    } catch (error) {
        res.status(500).json({success: false, message: "Server Error"});
    }
};