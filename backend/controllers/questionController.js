// controllers/questionController.js
const Question = require("../models/Question");
const Session = require("../models/Session");
const {
    getUserId,
    loadOwnedSession,
    loadOwnedQuestion,
    sendOwnershipError,
} = require("../utils/sessionOwnership");

// @desc    Add additional questions to an existing session
// @route   POST /api/questions/add
// @access  Private
exports.addQuestionsToSession = async (req, res) => {
    try {
        const { sessionId, questions } = req.body;
        const userId = getUserId(req);

        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "Valid questions array is required" });
        }

        const owned = await loadOwnedSession(sessionId, userId);
        if (owned.status) {
            return sendOwnershipError(res, owned);
        }

        const session = await Session.findById(sessionId).populate("questions");

        for (const q of questions) {
            if (!q.question || !q.answer) {
                return res.status(400).json({
                    message: "Each question must have both 'question' and 'answer' fields",
                });
            }
        }

        const existingQuestions = session.questions.map((q) => q.question.toLowerCase().trim());
        const uniqueQuestions = questions.filter(
            (q) => !existingQuestions.includes(q.question.toLowerCase().trim())
        );

        if (uniqueQuestions.length === 0) {
            return res.status(200).json({
                success: true,
                message: "All provided questions already exist in this session",
                questions: [],
            });
        }

        const createdQuestions = await Question.insertMany(
            uniqueQuestions.map((q) => ({
                session: sessionId,
                question: q.question,
                answer: q.answer,
            }))
        );

        session.questions.push(...createdQuestions.map((q) => q._id));
        await session.save();

        res.status(201).json({
            success: true,
            message: `Added ${createdQuestions.length} unique questions to the session`,
            questions: createdQuestions,
        });
    } catch (error) {
        console.error("Add question error:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message,
        });
    }
};

// @desc    Pin or unpin a question
// @route   POST /api/questions/:id/pin
// @access  Private
exports.togglePinQuestion = async (req, res) => {
    try {
        const userId = getUserId(req);
        const owned = await loadOwnedQuestion(req.params.id, userId);

        if (owned.status) {
            return sendOwnershipError(res, owned);
        }

        const { question } = owned;
        question.isPinned = !question.isPinned;
        await question.save();

        res.status(200).json({ success: true, question });
    } catch (error) {
        console.error("Toggle pin error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Update a note for a question
// @route   POST /api/questions/:id/note
// @access  Private
exports.updateQuestionNote = async (req, res) => {
    try {
        const { note } = req.body;
        const userId = getUserId(req);
        const owned = await loadOwnedQuestion(req.params.id, userId);

        if (owned.status) {
            return sendOwnershipError(res, owned);
        }

        const { question } = owned;
        question.note = note || "";
        await question.save();

        res.status(200).json({ success: true, question });
    } catch (error) {
        console.error("Update note error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
