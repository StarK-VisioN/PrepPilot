const {
    callAIWithRetry,
    cleanAndParseAIResponse,
    parseDeepDiveResponse,
    parseTopicQuestionsResponse,
    handleAIError,
} = require("../services/aiService");
const { getDocumentForUser } = require("../services/documentService");
const { resolveCompanyFields } = require("../utils/companies");
const Session = require("../models/Session");
const { QUESTION_GENERATION_USER_MESSAGE } = require("../utils/aiMessages");
const {
    getUserId,
    loadOwnedSession,
    sendOwnershipError,
} = require("../utils/sessionOwnership");
const {
    questionAnswerPrompt,
    resumeQuestionPrompt,
    jdQuestionPrompt,
    combinedQuestionPrompt,
    conceptExplainPrompt,
    topicQuestionPrompt,
} = require("../utils/prompts");

function buildTopicsFromExtracted(extractedData, fallback = "") {
    const parts = [
        ...(extractedData?.skills || []),
        ...(extractedData?.technologies || []),
    ];
    const unique = [...new Set(parts.map((p) => p.trim()).filter(Boolean))];
    return unique.length > 0 ? unique.join(", ") : fallback;
}

async function resolveGenerationContext(body, userId) {
    const {
        role,
        experience,
        topicsToFocus,
        numberOfQuestions,
        company,
        customCompanyName,
        generationMode = "manual",
        resumeDocumentId,
        jdDocumentId,
    } = body;

    const { company: normalizedCompany, customCompanyName: resolvedCustomName } =
        resolveCompanyFields(company, customCompanyName);
    let mode = generationMode;
    let resumeDoc = null;
    let jdDoc = null;

    if (resumeDocumentId) {
        resumeDoc = await getDocumentForUser(resumeDocumentId, userId);
    }
    if (jdDocumentId) {
        jdDoc = await getDocumentForUser(jdDocumentId, userId);
    }

    if (resumeDoc && jdDoc) {
        mode = "combined";
    } else if (resumeDoc) {
        mode = "resume";
    } else if (jdDoc) {
        mode = "jd";
    }

    const resolvedRole =
        role ||
        jdDoc?.extractedData?.role ||
        resumeDoc?.extractedData?.role ||
        "Software Engineer";

    const resolvedExperience =
        experience ||
        jdDoc?.extractedData?.experience ||
        resumeDoc?.extractedData?.experience ||
        "1";

    const resolvedTopics =
        topicsToFocus ||
        buildTopicsFromExtracted(jdDoc?.extractedData) ||
        buildTopicsFromExtracted(resumeDoc?.extractedData) ||
        "General software engineering";

    return {
        mode,
        company: normalizedCompany,
        customCompanyName: resolvedCustomName,
        numberOfQuestions: numberOfQuestions || 10,
        role: resolvedRole,
        experience: resolvedExperience,
        topicsToFocus: resolvedTopics,
        resumeDoc,
        jdDoc,
    };
}

function buildPromptForMode(ctx) {
    const base = {
        role: ctx.role,
        experience: ctx.experience,
        topicsToFocus: ctx.topicsToFocus,
        numberOfQuestions: ctx.numberOfQuestions,
        company: ctx.company,
        customCompanyName: ctx.customCompanyName,
    };

    switch (ctx.mode) {
        case "resume":
            return resumeQuestionPrompt({
                ...base,
                resumeText: ctx.resumeDoc.parsedText,
                extractedData: ctx.resumeDoc.extractedData,
            });
        case "jd":
            return jdQuestionPrompt({
                ...base,
                jdText: ctx.jdDoc.parsedText,
                extractedData: ctx.jdDoc.extractedData,
            });
        case "combined":
            return combinedQuestionPrompt({
                ...base,
                resumeText: ctx.resumeDoc.parsedText,
                jdText: ctx.jdDoc.parsedText,
                resumeExtract: ctx.resumeDoc.extractedData,
                jdExtract: ctx.jdDoc.extractedData,
            });
        default:
            return questionAnswerPrompt(
                ctx.role,
                ctx.experience,
                ctx.topicsToFocus,
                ctx.numberOfQuestions,
                ctx.company,
                ctx.customCompanyName
            );
    }
}

function validateGenerateRequest(body, ctx) {
    const { role, experience, topicsToFocus, resumeDocumentId, jdDocumentId } = body;

    if (ctx.mode === "manual") {
        if (!role || !experience || !topicsToFocus) {
            return "Missing required fields: role, experience, topicsToFocus";
        }
    }

    if (ctx.mode === "resume" && !resumeDocumentId) {
        return "resumeDocumentId is required for resume-based generation";
    }

    if (ctx.mode === "jd" && !jdDocumentId) {
        return "jdDocumentId is required for JD-based generation";
    }

    if (ctx.mode === "combined" && (!resumeDocumentId || !jdDocumentId)) {
        return "Both resumeDocumentId and jdDocumentId are required for combined generation";
    }

    if (ctx.mode === "manual" && (isNaN(experience) || parseFloat(experience) < 0)) {
        return "Experience must be a valid non-negative number";
    }

    if (ctx.company === "custom" && !ctx.customCompanyName?.trim()) {
        return "Please enter a company name when using a custom interview style.";
    }

    return null;
}

const generateInterviewQuestions = async (req, res) => {
    try {
        const ctx = await resolveGenerationContext(req.body, getUserId(req));
        const validationError = validateGenerateRequest(req.body, ctx);

        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const prompt = buildPromptForMode(ctx);
        console.log(
            `Generating questions — mode: ${ctx.mode}, company: ${ctx.company}${
                ctx.customCompanyName ? ` (${ctx.customCompanyName})` : ""
            }`
        );

        const rawText = await callAIWithRetry(prompt, 3, { max_tokens: 4096 });
        const data = cleanAndParseAIResponse(rawText);

        res.status(200).json({
            questions: data,
            meta: {
                generationMode: ctx.mode,
                company: ctx.company,
                customCompanyName: ctx.customCompanyName || null,
                role: ctx.role,
                experience: ctx.experience,
                topicsToFocus: ctx.topicsToFocus,
                resumeDocumentId: ctx.resumeDoc?._id || null,
                jdDocumentId: ctx.jdDoc?._id || null,
            },
        });
    } catch (error) {
        return handleAIError(error, res, "Failed to generate questions", {
            userMessage: QUESTION_GENERATION_USER_MESSAGE,
        });
    }
};

const generateConceptExplanation = async (req, res) => {
    try {
        const { question, answer, role } = req.body;

        if (!question) {
            return res.status(400).json({ message: "Missing required field: question" });
        }

        const prompt = conceptExplainPrompt(question, answer || "", role || "");
        const rawText = await callAIWithRetry(prompt, 2, {
            temperature: 0.5,
            max_tokens: 3072,
        });
        const data = parseDeepDiveResponse(rawText);

        if (!data.explanation?.trim()) {
            return res.status(422).json({
                message: "The AI service returned an empty deep dive. Please try again.",
                isRetryable: true,
            });
        }

        res.status(200).json(data);
    } catch (error) {
        return handleAIError(error, res, "Failed to generate explanation");
    }
};

const generateTopicQuestions = async (req, res) => {
    try {
        const {
            topic,
            experience,
            role,
            sessionId,
            company,
            customCompanyName,
            numberOfQuestions = 8,
            excludeQuestions = [],
        } = req.body;

        if (!topic?.trim()) {
            return res.status(400).json({ message: "Missing required field: topic" });
        }
        if (!role?.trim()) {
            return res.status(400).json({ message: "Missing required field: role" });
        }
        if (!experience?.toString().trim()) {
            return res.status(400).json({ message: "Missing required field: experience" });
        }

        const normalizedTopic = topic.trim();
        const isAppend = Array.isArray(excludeQuestions) && excludeQuestions.length > 0;
        const questionCount = Math.min(Math.max(parseInt(numberOfQuestions, 10) || 8, 5), 10);

        let session = null;

        if (sessionId) {
            const owned = await loadOwnedSession(sessionId, getUserId(req));
            if (owned.status) {
                return sendOwnershipError(res, owned);
            }
            session = owned.session;

            if (!isAppend) {
                const cacheIndex = (session.topicQuestionCache || []).findIndex(
                    (entry) =>
                        entry.topic?.toLowerCase() === normalizedTopic.toLowerCase()
                );

                if (cacheIndex >= 0) {
                    const cached = session.topicQuestionCache[cacheIndex];
                    if (cached?.questions?.length) {
                        return res.status(200).json({
                            topic: cached.topic,
                            questions: cached.questions,
                            newQuestions: [],
                            totalCount: cached.questions.length,
                            cached: true,
                            appended: false,
                        });
                    }
                    // Drop stale empty cache entry before regenerating
                    session.topicQuestionCache.splice(cacheIndex, 1);
                    await session.save();
                }
            }
        }

        const { company: resolvedCompany, customCompanyName: resolvedCustomName } =
            resolveCompanyFields(company, customCompanyName);

        const prompt = topicQuestionPrompt(
            normalizedTopic,
            role.trim(),
            experience.toString().trim(),
            resolvedCompany,
            resolvedCustomName,
            questionCount,
            excludeQuestions
        );

        console.log(
            `Generating topic questions — topic: ${normalizedTopic}, role: ${role}, append: ${isAppend}`
        );

        const rawText = await callAIWithRetry(prompt, 2, {
            temperature: 0.4,
            max_tokens: 2048,
        });
        const questions = parseTopicQuestionsResponse(rawText);

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(422).json({
                message: QUESTION_GENERATION_USER_MESSAGE,
                isRetryable: true,
            });
        }

        const existingTexts = new Set(
            excludeQuestions.map((q) => q.toLowerCase().trim())
        );

        const validQuestions = questions
            .map((q) => ({ question: q.question, answer: q.answer }))
            .filter((q) => {
                if (!q?.question || !q?.answer) return false;
                const key = q.question.toLowerCase().trim();
                if (existingTexts.has(key)) return false;
                existingTexts.add(key);
                return true;
            });

        if (validQuestions.length === 0) {
            return res.status(422).json({
                message: QUESTION_GENERATION_USER_MESSAGE,
                isRetryable: true,
            });
        }

        let totalCount = validQuestions.length;

        if (session) {
            session.topicQuestionCache = session.topicQuestionCache || [];
            const cacheIndex = session.topicQuestionCache.findIndex(
                (entry) => entry.topic.toLowerCase() === normalizedTopic.toLowerCase()
            );

            if (cacheIndex >= 0 && isAppend) {
                session.topicQuestionCache[cacheIndex].questions.push(...validQuestions);
                session.topicQuestionCache[cacheIndex].generatedAt = new Date();
                totalCount = session.topicQuestionCache[cacheIndex].questions.length;
            } else if (cacheIndex >= 0 && !isAppend) {
                session.topicQuestionCache[cacheIndex] = {
                    topic: normalizedTopic,
                    questions: validQuestions,
                    generatedAt: new Date(),
                };
                totalCount = validQuestions.length;
            } else if (cacheIndex < 0) {
                session.topicQuestionCache.push({
                    topic: normalizedTopic,
                    questions: validQuestions,
                    generatedAt: new Date(),
                });
            }

            session.topicQuestionCache = session.topicQuestionCache.filter(
                (entry) => entry.questions?.length > 0
            );

            await session.save();
        }

        res.status(200).json({
            topic: normalizedTopic,
            questions: isAppend ? validQuestions : validQuestions,
            newQuestions: isAppend ? validQuestions : [],
            totalCount,
            cached: false,
            appended: isAppend,
        });
    } catch (error) {
        return handleAIError(error, res, "Failed to generate topic questions", {
            userMessage: QUESTION_GENERATION_USER_MESSAGE,
        });
    }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation, generateTopicQuestions };
