const MockInterviewMessage = require("../models/MockInterviewMessage");
const { callAIWithMessages, callAIWithRetry, cleanAndParseAIResponse } = require("./aiService");
const {
    buildInterviewSystemPrompt,
    buildOpeningUserPrompt,
    buildFollowUpUserPrompt,
    buildEvaluationPrompt,
} = require("../utils/prompts/mockInterview");
const {
    getSessionState,
    setSessionState,
    buildInitialState,
} = require("./mockInterviewCacheService");

function inferQuestionType(session, text) {
    const lower = (text || "").toLowerCase();
    if (lower.includes("tell me about") || lower.includes("describe a time")) {
        return "behavioral";
    }
    if (
        lower.includes("design") ||
        lower.includes("algorithm") ||
        lower.includes("system") ||
        lower.includes("technical")
    ) {
        return "technical";
    }
    if (session.interviewType === "Behavioral") return "behavioral";
    if (session.interviewType === "Technical") return "technical";
    return "followup";
}

async function saveMessage(sessionId, sender, message, questionType, sequence) {
    return MockInterviewMessage.create({
        sessionId,
        sender,
        message,
        questionType,
        sequence,
    });
}

async function getMessagesForSession(sessionId) {
    return MockInterviewMessage.find({ sessionId }).sort({ sequence: 1 });
}

function buildChatMessages(session, dbMessages) {
    const system = buildInterviewSystemPrompt(session);
    const messages = [{ role: "system", content: system }];

    for (const msg of dbMessages) {
        messages.push({
            role: msg.sender === "ai" ? "assistant" : "user",
            content: msg.message,
        });
    }

    return messages;
}

async function generateOpeningMessage(session) {
    if (!process.env.GROQ_API_KEY) {
        return {
            text: `Hello! I'll be your interviewer today for this ${session.role} position. We have about ${session.duration} minutes. Let's begin — tell me about yourself and your relevant experience.`,
            questionType: "opening",
            aiAvailable: false,
        };
    }

    try {
        const messages = [
            { role: "system", content: buildInterviewSystemPrompt(session) },
            { role: "user", content: buildOpeningUserPrompt(session) },
        ];
        const text = await callAIWithMessages(messages, 3, {
            temperature: 0.7,
            max_tokens: 512,
        });
        return { text, questionType: "opening", aiAvailable: true };
    } catch (error) {
        console.warn("[mock-interview] opening AI failed:", error.message);
        return {
            text: `Welcome to your mock interview for ${session.role}. We have ${session.duration} minutes. Please introduce yourself and highlight your most relevant experience.`,
            questionType: "opening",
            aiAvailable: false,
        };
    }
}

async function generateFollowUpMessage(session, userMessage) {
    const dbMessages = await getMessagesForSession(session._id);
    const chatMessages = buildChatMessages(session, dbMessages);
    chatMessages.push({ role: "user", content: userMessage });
    chatMessages.push({ role: "user", content: buildFollowUpUserPrompt() });

    if (!process.env.GROQ_API_KEY) {
        return {
            text: "Thank you for that answer. Could you elaborate on the specific impact and any metrics you can share?",
            questionType: "followup",
            aiAvailable: false,
        };
    }

    try {
        const text = await callAIWithMessages(chatMessages, 3, {
            temperature: 0.7,
            max_tokens: 512,
        });
        return {
            text,
            questionType: inferQuestionType(session, text),
            aiAvailable: true,
        };
    } catch (error) {
        console.warn("[mock-interview] follow-up AI failed:", error.message);
        return {
            text: "Thanks for sharing. Can you walk me through the specific steps you took and what the outcome was?",
            questionType: "followup",
            aiAvailable: false,
        };
    }
}

function normalizeFeedback(parsed, interviewType) {
    const clamp = (v, max = 100) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));

    const feedback = {
        communication: clamp(parsed.communication),
        technicalKnowledge: clamp(parsed.technicalKnowledge),
        problemSolving: clamp(parsed.problemSolving),
        confidence: clamp(parsed.confidence),
        clarity: clamp(parsed.clarity),
        correctness: clamp(parsed.correctness),
        depth: clamp(parsed.depth),
        systemDesign: clamp(parsed.systemDesign),
        tradeoffThinking: clamp(parsed.tradeoffThinking),
        scalabilityUnderstanding: clamp(parsed.scalabilityUnderstanding),
        starSituation: clamp(parsed.starSituation, 25),
        starTask: clamp(parsed.starTask, 25),
        starAction: clamp(parsed.starAction, 25),
        starResult: clamp(parsed.starResult, 25),
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter(Boolean) : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.filter(Boolean) : [],
        recommendations: Array.isArray(parsed.recommendations)
            ? parsed.recommendations.filter(Boolean)
            : [],
        overallScore: clamp(parsed.overallScore),
        aiAvailable: true,
    };

    if (!feedback.overallScore) {
        if (interviewType === "Technical") {
            feedback.overallScore = Math.round(
                (feedback.technicalKnowledge +
                    feedback.problemSolving +
                    feedback.correctness +
                    feedback.depth +
                    feedback.systemDesign) /
                    5
            );
        } else if (interviewType === "Behavioral") {
            const star =
                feedback.starSituation +
                feedback.starTask +
                feedback.starAction +
                feedback.starResult;
            feedback.overallScore = Math.round((star / 100) * 100);
        } else {
            feedback.overallScore = Math.round(
                (feedback.communication +
                    feedback.technicalKnowledge +
                    feedback.problemSolving +
                    feedback.clarity) /
                    4
            );
        }
    }

    return feedback;
}

function buildUnavailableFeedback() {
    return {
        communication: 0,
        technicalKnowledge: 0,
        problemSolving: 0,
        confidence: 0,
        clarity: 0,
        correctness: 0,
        depth: 0,
        systemDesign: 0,
        tradeoffThinking: 0,
        scalabilityUnderstanding: 0,
        starSituation: 0,
        starTask: 0,
        starAction: 0,
        starResult: 0,
        strengths: [],
        weaknesses: [],
        recommendations: [
            "AI evaluation is temporarily unavailable. Your session has been saved.",
            "Review your answers and try ending the interview again later.",
        ],
        overallScore: 0,
        aiAvailable: false,
    };
}

async function generateEvaluation(session) {
    const messages = await getMessagesForSession(session._id);
    const transcript = messages
        .map((m) => `${m.sender === "ai" ? "Interviewer" : "Candidate"}: ${m.message}`)
        .join("\n\n");

    if (!process.env.GROQ_API_KEY || !transcript.trim()) {
        return {
            feedback: buildUnavailableFeedback(),
            summary: "Interview completed. AI evaluation is temporarily unavailable.",
        };
    }

    try {
        const prompt = buildEvaluationPrompt(session, transcript);
        const raw = await callAIWithRetry(prompt, 3, { temperature: 0.3, max_tokens: 2048 });
        const parsed = cleanAndParseAIResponse(raw);
        const feedback = normalizeFeedback(parsed, session.interviewType);
        return {
            feedback,
            summary: parsed.summary || "Interview completed successfully.",
        };
    } catch (error) {
        console.warn("[mock-interview] evaluation failed:", error.message);
        return {
            feedback: buildUnavailableFeedback(),
            summary: "Interview completed. AI evaluation is temporarily unavailable.",
        };
    }
}

async function syncSessionCache(session, messages) {
    const state = buildInitialState(session, messages);
    await setSessionState(session._id.toString(), state);
    return state;
}

module.exports = {
    saveMessage,
    getMessagesForSession,
    generateOpeningMessage,
    generateFollowUpMessage,
    generateEvaluation,
    syncSessionCache,
};
