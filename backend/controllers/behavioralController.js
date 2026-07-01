const mongoose = require("mongoose");
const BehavioralQuestion = require("../models/BehavioralQuestion");
const BehavioralSubmission = require("../models/BehavioralSubmission");
const { BEHAVIORAL_CATEGORIES } = require("../models/BehavioralQuestion");
const { getUserId } = require("../utils/sessionOwnership");
const { scheduleAnalyticsRefresh } = require("../services/analyticsWorker");
const {
    getCachedQuestions,
    setCachedQuestions,
    getCachedQuestion,
    setCachedQuestion,
    getCachedUserStats,
    setCachedUserStats,
    invalidateUserStats,
} = require("../services/behavioralCacheService");

function sanitizeQuestionListItem(doc) {
    const q = doc.toObject ? doc.toObject() : doc;
    return {
        _id: q._id,
        title: q.title,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        tags: q.tags || [],
        companyTags: q.companyTags || [],
        order: q.order,
    };
}

function sanitizeQuestionDetail(doc) {
    const q = doc.toObject ? doc.toObject() : doc;
    return {
        _id: q._id,
        title: q.title,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        hints: q.hints || [],
        tags: q.tags || [],
        companyTags: q.companyTags || [],
        order: q.order,
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
    };
}

function sanitizeSubmission(doc) {
    const s = doc.toObject ? doc.toObject() : doc;
    return {
        _id: s._id,
        questionId: s.questionId,
        answer: s.answer,
        evaluation: s.evaluation,
        score: s.score,
        category: s.category,
        attemptNumber: s.attemptNumber,
        createdAt: s.createdAt,
    };
}

async function buildCategoryStats(userId) {
    const [questionCounts, submissionStats] = await Promise.all([
        BehavioralQuestion.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
        ]),
        BehavioralSubmission.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: "$category",
                    attempted: { $addToSet: "$questionId" },
                    avgScore: { $avg: "$score" },
                    bestScore: { $max: "$score" },
                    totalSubmissions: { $sum: 1 },
                },
            },
        ]),
    ]);

    const countMap = Object.fromEntries(questionCounts.map((r) => [r._id, r.count]));
    const statsMap = Object.fromEntries(
        submissionStats.map((r) => [
            r._id,
            {
                attemptedCount: r.attempted.length,
                avgScore: r.avgScore ? Math.round(r.avgScore) : null,
                bestScore: r.bestScore ?? null,
                totalSubmissions: r.totalSubmissions,
            },
        ])
    );

    return BEHAVIORAL_CATEGORIES.map((category) => {
        const total = countMap[category] || 0;
        const stats = statsMap[category] || {
            attemptedCount: 0,
            avgScore: null,
            bestScore: null,
            totalSubmissions: 0,
        };
        const completionPercent =
            total > 0 ? Math.round((stats.attemptedCount / total) * 100) : 0;

        return {
            category,
            questionCount: total,
            attemptedCount: stats.attemptedCount,
            completionPercent,
            averageScore: stats.avgScore,
            bestScore: stats.bestScore,
            totalSubmissions: stats.totalSubmissions,
            status:
                stats.attemptedCount === 0
                    ? "not_started"
                    : stats.attemptedCount >= total
                      ? "completed"
                      : "in_progress",
        };
    });
}

async function buildUserStats(userId) {
    const cached = await getCachedUserStats(userId);
    if (cached) return cached;

    const [totalQuestions, submissions, categoryStats] = await Promise.all([
        BehavioralQuestion.countDocuments({ isActive: true }),
        BehavioralSubmission.find({ user: userId }).sort({ createdAt: -1 }),
        buildCategoryStats(userId),
    ]);

    const uniqueQuestions = new Set(submissions.map((s) => String(s.questionId)));
    const scoredSubmissions = submissions.filter((s) => s.score > 0);
    const averageScore =
        scoredSubmissions.length > 0
            ? Math.round(
                  scoredSubmissions.reduce((sum, s) => sum + s.score, 0) /
                      scoredSubmissions.length
              )
            : null;

    const categoryWithScores = categoryStats.filter((c) => c.averageScore !== null);
    const strongestCategory =
        categoryWithScores.length > 0
            ? [...categoryWithScores].sort((a, b) => b.averageScore - a.averageScore)[0]
                  .category
            : null;
    const weakestCategory =
        categoryWithScores.length > 0
            ? [...categoryWithScores].sort((a, b) => a.averageScore - b.averageScore)[0]
                  .category
            : null;

    const stats = {
        totalQuestions,
        questionsAttempted: uniqueQuestions.size,
        totalEvaluations: submissions.length,
        averageScore,
        strongestCategory,
        weakestCategory,
        categories: categoryStats,
    };

    await setCachedUserStats(userId, stats);
    return stats;
}

const getQuestions = async (req, res) => {
    try {
        const { category, difficulty } = req.query;
        const userId = getUserId(req);

        let questions;
        const useCache = !category && !difficulty;
        if (useCache) {
            questions = await getCachedQuestions();
        }

        if (!questions) {
            const filter = { isActive: true };
            if (category && BEHAVIORAL_CATEGORIES.includes(category)) {
                filter.category = category;
            }
            if (difficulty && ["Easy", "Medium", "Hard"].includes(difficulty)) {
                filter.difficulty = difficulty;
            }

            const docs = await BehavioralQuestion.find(filter)
                .sort({ category: 1, order: 1, title: 1 })
                .select("title question category difficulty tags companyTags order");

            questions = docs.map(sanitizeQuestionListItem);
            if (useCache) {
                await setCachedQuestions(questions);
            }
        }

        const stats = await buildUserStats(userId);

        res.status(200).json({
            success: true,
            questions,
            categories: stats.categories,
            stats: {
                totalQuestions: stats.totalQuestions,
                questionsAttempted: stats.questionsAttempted,
                totalEvaluations: stats.totalEvaluations,
                averageScore: stats.averageScore,
            },
        });
    } catch (error) {
        console.error("getQuestions error:", error);
        res.status(500).json({ success: false, message: "Failed to load behavioral questions" });
    }
};

const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getUserId(req);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid question id" });
        }

        let question = await getCachedQuestion(id);
        if (!question) {
            const doc = await BehavioralQuestion.findOne({ _id: id, isActive: true });
            if (!doc) {
                return res.status(404).json({ success: false, message: "Question not found" });
            }
            question = sanitizeQuestionDetail(doc);
            await setCachedQuestion(id, question);
        }

        const [submissions, attemptCount] = await Promise.all([
            BehavioralSubmission.find({ user: userId, questionId: id })
                .sort({ createdAt: -1 })
                .limit(10),
            BehavioralSubmission.countDocuments({ user: userId, questionId: id }),
        ]);

        const bestScore = submissions.reduce((max, s) => Math.max(max, s.score || 0), 0);

        res.status(200).json({
            success: true,
            question,
            userProgress: {
                attemptCount,
                bestScore: bestScore || null,
                lastSubmission: submissions[0] ? sanitizeSubmission(submissions[0]) : null,
                history: submissions.map(sanitizeSubmission),
            },
        });
    } catch (error) {
        console.error("getQuestionById error:", error);
        res.status(500).json({ success: false, message: "Failed to load question" });
    }
};

const submitAnswer = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { questionId, answer } = req.body;

        if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({ success: false, message: "Valid questionId is required" });
        }

        if (!answer || typeof answer !== "string" || !answer.trim()) {
            return res.status(400).json({ success: false, message: "Answer is required" });
        }

        if (answer.trim().length > 10000) {
            return res.status(400).json({
                success: false,
                message: "Answer must be under 10,000 characters",
            });
        }

        const questionDoc = await BehavioralQuestion.findOne({
            _id: questionId,
            isActive: true,
        });

        if (!questionDoc) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        const priorCount = await BehavioralSubmission.countDocuments({
            user: userId,
            questionId,
        });

        const evaluation = await evaluateBehavioralAnswer({
            question: questionDoc.question,
            answer: answer.trim(),
        });

        const submission = await BehavioralSubmission.create({
            user: userId,
            questionId,
            answer: answer.trim(),
            evaluation,
            score: evaluation.score || 0,
            category: questionDoc.category,
            attemptNumber: priorCount + 1,
        });

        await invalidateUserStats(userId);
        scheduleAnalyticsRefresh(userId);

        res.status(201).json({
            success: true,
            submission: sanitizeSubmission(submission),
            aiAvailable: evaluation.aiAvailable !== false,
        });
    } catch (error) {
        console.error("submitAnswer error:", error);
        res.status(500).json({ success: false, message: "Failed to submit answer" });
    }
};

const getHistory = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { category, limit = 50 } = req.query;
        const filter = { user: userId };
        if (category && BEHAVIORAL_CATEGORIES.includes(category)) {
            filter.category = category;
        }

        const submissions = await BehavioralSubmission.find(filter)
            .sort({ createdAt: -1 })
            .limit(Math.min(Number(limit) || 50, 100))
            .populate("questionId", "title question category difficulty");

        const history = submissions.map((s) => {
            const doc = s.toObject();
            const q = doc.questionId;
            return {
                _id: doc._id,
                questionId: q?._id || doc.questionId,
                questionTitle: q?.title || "Unknown question",
                questionText: q?.question || "",
                category: doc.category || q?.category,
                difficulty: q?.difficulty,
                answer: doc.answer,
                score: doc.score,
                ratingLabel: doc.evaluation?.ratingLabel || "",
                overallFeedback: doc.evaluation?.overallFeedback || "",
                attemptNumber: doc.attemptNumber,
                aiAvailable: doc.evaluation?.aiAvailable !== false,
                createdAt: doc.createdAt,
            };
        });

        res.status(200).json({ success: true, history });
    } catch (error) {
        console.error("getHistory error:", error);
        res.status(500).json({ success: false, message: "Failed to load history" });
    }
};

const getStats = async (req, res) => {
    try {
        const userId = getUserId(req);
        const stats = await buildUserStats(userId);
        res.status(200).json({ success: true, stats });
    } catch (error) {
        console.error("getStats error:", error);
        res.status(500).json({ success: false, message: "Failed to load stats" });
    }
};

module.exports = {
    getQuestions,
    getQuestionById,
    submitAnswer,
    getHistory,
    getStats,
};
