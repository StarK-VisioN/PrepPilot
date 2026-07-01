const CodingChallenge = require("../models/CodingChallenge");
const CodingSubmission = require("../models/CodingSubmission");
const { runChallengeCode, submitChallengeCode } = require("../services/testRunnerService");
const {
    getDraftsForChallenge,
    setDraft,
} = require("../services/draftStorageService");
const {
    getPreferredCodingLanguage,
    setPreferredCodingLanguage,
} = require("../services/codingPreferenceService");
const { checkAllRuntimes } = require("../services/codeRunners/shared/runtimeAvailability");
const { getUserId } = require("../utils/sessionOwnership");
const {
    getVisibleTestCasesForClient,
    sanitizeExecutionPayload,
    sanitizeResultForClient,
} = require("../utils/testCaseUtils");
const { scheduleAnalyticsRefresh } = require("../services/analyticsWorker");
const {
    SUPPORTED_LANGUAGES,
    DEFAULT_CODING_LANGUAGE,
    resolveExecutableLanguage,
    getStarterForLanguage,
} = require("../utils/codingLanguages");

function sanitizeChallenge(challenge) {
    const doc = challenge.toObject ? challenge.toObject() : challenge;
    const javascriptStarter = getStarterForLanguage(doc.starterCode);

    return {
        _id: doc._id,
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        difficulty: doc.difficulty,
        tags: doc.tags || [],
        examples: doc.examples || [],
        constraints: doc.constraints || [],
        starterCode: { javascript: javascriptStarter },
        supportedLanguages: ["javascript"],
        functionName: doc.functionName,
        expectedInputFormat: doc.expectedInputFormat,
        testCases: getVisibleTestCasesForClient(doc.testCases),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}

function sanitizeChallengeListItem(challenge) {
    const doc = challenge.toObject ? challenge.toObject() : challenge;
    return {
        _id: doc._id,
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        difficulty: doc.difficulty,
        tags: doc.tags || [],
        createdAt: doc.createdAt,
    };
}

const getLanguages = async (req, res) => {
    const runtimes = await checkAllRuntimes();
    res.status(200).json({
        success: true,
        languages: SUPPORTED_LANGUAGES.map((lang) => ({
            ...lang,
            available: runtimes[lang.id]?.available ?? false,
            unavailableMessage: runtimes[lang.id]?.message || null,
        })),
    });
};

const getRuntimes = async (req, res) => {
    try {
        const runtimes = await checkAllRuntimes();
        res.status(200).json({ success: true, runtimes });
    } catch (error) {
        console.error("getRuntimes error:", error);
        res.status(500).json({ success: false, message: "Failed to check runtimes" });
    }
};

const getPreferences = async (req, res) => {
    try {
        const userId = getUserId(req);
        const preferredCodingLanguage = await getPreferredCodingLanguage(userId);

        res.status(200).json({
            success: true,
            preferredCodingLanguage,
        });
    } catch (error) {
        console.error("getPreferences error:", error);
        res.status(500).json({ success: false, message: "Failed to load coding preferences" });
    }
};

const updatePreferences = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { preferredCodingLanguage } = req.body;

        if (!preferredCodingLanguage) {
            return res.status(400).json({
                success: false,
                message: "preferredCodingLanguage is required",
            });
        }

        const language = await setPreferredCodingLanguage(userId, preferredCodingLanguage);

        res.status(200).json({
            success: true,
            preferredCodingLanguage: language,
        });
    } catch (error) {
        console.error("updatePreferences error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

const getChallenges = async (req, res) => {
    try {
        const { difficulty, tag } = req.query;
        const filter = { isActive: true };

        if (difficulty && ["Easy", "Medium", "Hard"].includes(difficulty)) {
            filter.difficulty = difficulty;
        }
        if (tag) {
            filter.tags = tag;
        }

        const challenges = await CodingChallenge.find(filter)
            .sort({ difficulty: 1, title: 1 })
            .select("title slug description difficulty tags createdAt");

        res.status(200).json({
            success: true,
            challenges: challenges.map(sanitizeChallengeListItem),
        });
    } catch (error) {
        console.error("getChallenges error:", error);
        res.status(500).json({ success: false, message: "Failed to load challenges" });
    }
};

const getChallengeById = async (req, res) => {
    try {
        const challenge = await CodingChallenge.findOne({
            _id: req.params.id,
            isActive: true,
        });

        if (!challenge) {
            return res.status(404).json({ success: false, message: "Challenge not found" });
        }

        res.status(200).json({
            success: true,
            challenge: sanitizeChallenge(challenge),
        });
    } catch (error) {
        console.error("getChallengeById error:", error);
        res.status(500).json({ success: false, message: "Failed to load challenge" });
    }
};

const getChallengeBySlug = async (req, res) => {
    try {
        const challenge = await CodingChallenge.findOne({
            slug: req.params.slug.toLowerCase(),
            isActive: true,
        });

        if (!challenge) {
            return res.status(404).json({ success: false, message: "Challenge not found" });
        }

        res.status(200).json({
            success: true,
            challenge: sanitizeChallenge(challenge),
        });
    } catch (error) {
        console.error("getChallengeBySlug error:", error);
        res.status(500).json({ success: false, message: "Failed to load challenge" });
    }
};

const runCode = async (req, res) => {
    try {
        const { challengeId, code, language } = req.body;
        const resolved = resolveExecutableLanguage(language);

        if (!challengeId || !code) {
            return res.status(400).json({
                success: false,
                message: "challengeId and code are required",
            });
        }

        if (!resolved.ok) {
            return res.status(400).json({ success: false, message: resolved.message });
        }

        const result = await runChallengeCode({
            challengeId,
            code,
            language: resolved.language,
            mode: "run",
        });

        res.status(200).json({
            success: true,
            ...sanitizeExecutionPayload(result),
        });
    } catch (error) {
        console.error("runCode error:", error);
        const status = error.statusCode || (error.message.includes("not found") ? 404 : 400);
        res.status(status).json({ success: false, message: error.message });
    }
};

const submitCode = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { challengeId, code, language } = req.body;
        const resolved = resolveExecutableLanguage(language);

        if (!challengeId || !code) {
            return res.status(400).json({
                success: false,
                message: "challengeId and code are required",
            });
        }

        if (!resolved.ok) {
            return res.status(400).json({ success: false, message: resolved.message });
        }

        const result = await submitChallengeCode({
            challengeId,
            code,
            language: resolved.language,
        });

        const submission = await CodingSubmission.create({
            user: userId,
            challengeId,
            code,
            language: resolved.language,
            status: result.status,
            passedCount: result.passedCount,
            totalCount: result.totalCount,
            results: result.results,
            runtimeMs: result.runtimeMs,
            submittedAt: new Date(),
        });

        scheduleAnalyticsRefresh(userId);

        res.status(201).json({
            success: true,
            submission: {
                _id: submission._id,
                status: submission.status,
                passedCount: submission.passedCount,
                totalCount: submission.totalCount,
                results: submission.results.map(sanitizeResultForClient),
                runtimeMs: submission.runtimeMs,
                language: submission.language,
                submittedAt: submission.submittedAt,
            },
        });
    } catch (error) {
        console.error("submitCode error:", error);
        const status = error.statusCode || (error.message.includes("not found") ? 404 : 400);
        res.status(status).json({ success: false, message: error.message });
    }
};

const getSubmissions = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { challengeId } = req.params;

        const submissions = await CodingSubmission.find({
            user: userId,
            challengeId,
        })
            .sort({ submittedAt: -1 })
            .limit(20)
            .select("status passedCount totalCount runtimeMs submittedAt language");

        res.status(200).json({ success: true, submissions });
    } catch (error) {
        console.error("getSubmissions error:", error);
        res.status(500).json({ success: false, message: "Failed to load submissions" });
    }
};

const getDraftCode = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { challengeId } = req.params;
        const preferredCodingLanguage = await getPreferredCodingLanguage(userId);
        const { codes, languages } = await getDraftsForChallenge(userId, challengeId);

        res.status(200).json({
            success: true,
            draft:
                Object.keys(codes).length > 0
                    ? {
                          codes,
                          languages,
                          language: preferredCodingLanguage,
                      }
                    : null,
            preferredCodingLanguage,
        });
    } catch (error) {
        console.warn("getDraftCode error:", error.message);
        res.status(200).json({
            success: true,
            draft: null,
            preferredCodingLanguage: DEFAULT_CODING_LANGUAGE,
        });
    }
};

const saveDraftCode = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { challengeId } = req.params;
        const { code, language = DEFAULT_CODING_LANGUAGE } = req.body;

        if (typeof code !== "string") {
            return res.status(400).json({ success: false, message: "code is required" });
        }

        const resolved = resolveExecutableLanguage(language);
        if (!resolved.ok) {
            return res.status(400).json({ success: false, message: resolved.message });
        }

        await setDraft(userId, challengeId, resolved.language, code);

        res.status(200).json({ success: true, message: "Draft saved" });
    } catch (error) {
        console.warn("saveDraftCode error:", error.message);
        res.status(200).json({ success: true, message: "Draft save skipped" });
    }
};

module.exports = {
    getLanguages,
    getRuntimes,
    getPreferences,
    updatePreferences,
    getChallenges,
    getChallengeById,
    getChallengeBySlug,
    runCode,
    submitCode,
    getSubmissions,
    getDraftCode,
    saveDraftCode,
};
