const ResumeAnalysis = require("../models/ResumeAnalysis");
const UserLearningGoal = require("../models/UserLearningGoal");
const { callAIWithRetry, cleanAndParseAIResponse } = require("./aiService");
const { buildResumeAnalysisPrompt } = require("../utils/prompts/resumeAnalysis");
const {
    parseDocumentBuffer,
    validateDocumentFile,
    normalizeParsedText,
    isPdfBuffer,
    MIN_EXTRACTED_TEXT_LENGTH,
} = require("./documentParserService");
const {
    getCachedResumeAnalysis,
    setCachedResumeAnalysis,
    invalidateResumeAnalysisCache,
} = require("./resumeAnalysisCacheService");

function validatePdfResume(file) {
    validateDocumentFile(file);

    const ext = (file.originalname || "").slice((file.originalname || "").lastIndexOf(".")).toLowerCase();
    const mime = (file.mimetype || "").toLowerCase();
    const isPdf =
        mime === "application/pdf" ||
        mime === "application/x-pdf" ||
        ext === ".pdf" ||
        isPdfBuffer(file.buffer);

    if (!isPdf) {
        throw new Error("Only PDF resumes are accepted for analytics upload.");
    }
}

function normalizeAnalysisPayload(parsed) {
    const keywordMatch = parsed.keywordMatch || {};
    const roleFit = parsed.roleFit || {};

    return {
        atsScore: Math.min(100, Math.max(0, Math.round(Number(parsed.atsScore) || 0))),
        summary: String(parsed.summary || "").trim(),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter(Boolean) : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.filter(Boolean) : [],
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills.filter(Boolean) : [],
        keywordMatch: {
            matched: Array.isArray(keywordMatch.matched) ? keywordMatch.matched.filter(Boolean) : [],
            missing: Array.isArray(keywordMatch.missing) ? keywordMatch.missing.filter(Boolean) : [],
        },
        formattingFeedback: Array.isArray(parsed.formattingFeedback)
            ? parsed.formattingFeedback.filter(Boolean)
            : [],
        roleFit: {
            score: Math.min(100, Math.max(0, Math.round(Number(roleFit.score) || 0))),
            bestFitRoles: Array.isArray(roleFit.bestFitRoles) ? roleFit.bestFitRoles.filter(Boolean) : [],
            notSuitableRoles: Array.isArray(roleFit.notSuitableRoles)
                ? roleFit.notSuitableRoles.filter(Boolean)
                : [],
        },
        improvementSuggestions: Array.isArray(parsed.improvementSuggestions)
            ? parsed.improvementSuggestions.filter(Boolean)
            : [],
        recommendedTopics: Array.isArray(parsed.recommendedTopics)
            ? parsed.recommendedTopics.filter(Boolean)
            : [],
        learningRoadmap: Array.isArray(parsed.learningRoadmap)
            ? parsed.learningRoadmap.map((week) => ({
                  week: week.week || "",
                  focus: week.focus || "",
                  topics: Array.isArray(week.topics) ? week.topics.filter(Boolean) : [],
                  tasks: Array.isArray(week.tasks) ? week.tasks.filter(Boolean) : [],
              }))
            : [],
        analysisStatus: "complete",
        aiAvailable: true,
    };
}

function createTextOnlyAnalysis(extractedText) {
    return {
        atsScore: 0,
        summary: "",
        strengths: [],
        weaknesses: [],
        missingSkills: [],
        keywordMatch: { matched: [], missing: [] },
        formattingFeedback: [],
        roleFit: { score: 0, bestFitRoles: [], notSuitableRoles: [] },
        improvementSuggestions: [],
        recommendedTopics: [],
        learningRoadmap: [],
        analysisStatus: "text_only",
        aiAvailable: false,
        extractedText,
    };
}

async function analyzeResumeText(extractedText, targetRole) {
    if (!process.env.GROQ_API_KEY) {
        return createTextOnlyAnalysis(extractedText);
    }

    try {
        const prompt = buildResumeAnalysisPrompt(extractedText, targetRole);
        const raw = await callAIWithRetry(prompt, 2, { temperature: 0.3, max_tokens: 4096 });
        const parsed = cleanAndParseAIResponse(raw);
        return normalizeAnalysisPayload(parsed);
    } catch (error) {
        console.warn("[resume-analysis] AI analysis failed:", error.message);
        return createTextOnlyAnalysis(extractedText);
    }
}

function toPublicAnalysis(doc, { includeText = false } = {}) {
    if (!doc) return null;

    const base = {
        _id: doc._id,
        fileName: doc.fileName,
        atsScore: doc.atsScore,
        summary: doc.summary,
        strengths: doc.strengths || [],
        weaknesses: doc.weaknesses || [],
        missingSkills: doc.missingSkills || [],
        keywordMatch: doc.keywordMatch || { matched: [], missing: [] },
        formattingFeedback: doc.formattingFeedback || [],
        roleFit: doc.roleFit || { score: 0, bestFitRoles: [], notSuitableRoles: [] },
        improvementSuggestions: doc.improvementSuggestions || [],
        recommendedTopics: doc.recommendedTopics || [],
        learningRoadmap: doc.learningRoadmap || [],
        analysisStatus: doc.analysisStatus,
        aiAvailable: doc.aiAvailable,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };

    if (doc.analysisStatus === "text_only") {
        base.message = "AI resume analysis is temporarily unavailable.";
    }

    if (includeText) {
        base.extractedText = doc.extractedText;
    }

    return base;
}

async function extractPdfText(file) {
    const text = await parseDocumentBuffer(file.buffer, file.mimetype, file.originalname);
    const normalized = normalizeParsedText(text);

    if (normalized.length < MIN_EXTRACTED_TEXT_LENGTH) {
        throw new Error(
            "Could not extract enough text from this PDF. It may be scanned or image-based — try a text-based PDF export."
        );
    }

    return normalized;
}

async function uploadAndAnalyzeResume(userId, file) {
    validatePdfResume(file);
    const extractedText = await extractPdfText(file);

    const goals = await UserLearningGoal.findOne({ user: userId });
    const targetRole = goals?.targetRole || "Software Engineer";
    const analysis = await analyzeResumeText(extractedText, targetRole);

    const record = await ResumeAnalysis.create({
        user: userId,
        fileName: file.originalname || "resume.pdf",
        extractedText,
        ...analysis,
    });

    const publicRecord = toPublicAnalysis(record);
    await setCachedResumeAnalysis(userId, publicRecord);

    return publicRecord;
}

async function getLatestResumeAnalysis(userId) {
    const cached = await getCachedResumeAnalysis(userId);
    if (cached) return cached;

    const latest = await ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!latest) return null;

    const publicRecord = toPublicAnalysis(latest);
    await setCachedResumeAnalysis(userId, publicRecord);
    return publicRecord;
}

async function getResumeAnalysisHistory(userId, limit = 20) {
    const records = await ResumeAnalysis.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("-extractedText");

    return records.map((doc) => toPublicAnalysis(doc));
}

async function deleteResumeAnalysis(userId, analysisId) {
    const deleted = await ResumeAnalysis.findOneAndDelete({ _id: analysisId, user: userId });
    if (!deleted) return null;

    await invalidateResumeAnalysisCache(userId);

    const latest = await ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 });
    if (latest) {
        await setCachedResumeAnalysis(userId, toPublicAnalysis(latest));
    }

    return deleted;
}

function hasPlatformActivity(summary) {
    return (
        (summary?.coding?.totalSubmissions || 0) > 0 ||
        (summary?.behavioral?.totalAttempts || 0) > 0 ||
        (summary?.mock?.completed || 0) > 0 ||
        (summary?.session?.totalQuestions || 0) > 0
    );
}

function buildResumeWeaknessTopics(resumeAnalysis) {
    if (!resumeAnalysis || resumeAnalysis.analysisStatus === "text_only") return [];

    const topics = new Set([
        ...(resumeAnalysis.missingSkills || []),
        ...(resumeAnalysis.weaknesses || []),
        ...(resumeAnalysis.recommendedTopics || []),
    ]);

    return [...topics].slice(0, 8).map((topic, index) => ({
        topic,
        category: "general",
        source: "resume",
        attempts: 0,
        averageScore: Math.max(0, 100 - (resumeAnalysis.atsScore || 50)),
        weakScore: Math.min(100, 60 + index * 3),
        trend: "stable",
        fromResume: true,
    }));
}

function mergeWeaknessInsights({ resumeAnalysis, weakTopics, summary }) {
    const hasActivity = hasPlatformActivity(summary);
    const resumeWeakTopics = buildResumeWeaknessTopics(resumeAnalysis);

    if (!resumeAnalysis) {
        return {
            foundation: "activity",
            combinedWeakTopics: weakTopics,
            hasResume: false,
            hasActivity,
        };
    }

    if (!hasActivity) {
        return {
            foundation: "resume",
            combinedWeakTopics: resumeWeakTopics.length ? resumeWeakTopics : weakTopics,
            hasResume: true,
            hasActivity: false,
        };
    }

    const seen = new Set(weakTopics.map((t) => t.topic.toLowerCase()));
    const merged = [...weakTopics];

    for (const rt of resumeWeakTopics) {
        if (!seen.has(rt.topic.toLowerCase())) {
            merged.push(rt);
            seen.add(rt.topic.toLowerCase());
        }
    }

    return {
        foundation: "combined",
        combinedWeakTopics: merged.slice(0, 10),
        hasResume: true,
        hasActivity: true,
    };
}

module.exports = {
    uploadAndAnalyzeResume,
    getLatestResumeAnalysis,
    getResumeAnalysisHistory,
    deleteResumeAnalysis,
    mergeWeaknessInsights,
    toPublicAnalysis,
    hasPlatformActivity,
};
