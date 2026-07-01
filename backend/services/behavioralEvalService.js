const { callAIWithRetry, cleanAndParseAIResponse } = require("./aiService");
const { buildStarEvaluationPrompt } = require("../utils/prompts/behavioral");

const RATING_THRESHOLDS = [
    { min: 90, label: "Excellent" },
    { min: 75, label: "Good" },
    { min: 60, label: "Average" },
    { min: 0, label: "Needs Improvement" },
];

function getRatingLabel(score) {
    const match = RATING_THRESHOLDS.find((t) => score >= t.min);
    return match ? match.label : "Needs Improvement";
}

function clampScore(value, max = 25) {
    const num = Number(value);
    if (Number.isNaN(num)) return 0;
    return Math.max(0, Math.min(max, Math.round(num)));
}

function normalizeSection(raw = {}, sectionName) {
    const score = clampScore(raw.score);
    return {
        present: raw.present === true || score > 0,
        score,
        feedback: typeof raw.feedback === "string" ? raw.feedback.trim() : "",
        section: sectionName,
    };
}

function normalizeEvaluation(parsed) {
    const situation = normalizeSection(parsed.situation, "Situation");
    const task = normalizeSection(parsed.task, "Task");
    const action = normalizeSection(parsed.action, "Action");
    const result = normalizeSection(parsed.result, "Result");

    const score =
        typeof parsed.score === "number"
            ? Math.max(0, Math.min(100, Math.round(parsed.score)))
            : situation.score + task.score + action.score + result.score;

    const missingSections = Array.isArray(parsed.missingSections)
        ? parsed.missingSections.filter(Boolean)
        : ["Situation", "Task", "Action", "Result"].filter(
              (name) => !({ Situation: situation, Task: task, Action: action, Result: result }[name].present)
          );

    return {
        situation,
        task,
        action,
        result,
        missingSections,
        overallFeedback:
            typeof parsed.overallFeedback === "string" ? parsed.overallFeedback.trim() : "",
        improvementSuggestions: Array.isArray(parsed.improvementSuggestions)
            ? parsed.improvementSuggestions.filter((s) => typeof s === "string" && s.trim())
            : [],
        score,
        ratingLabel: getRatingLabel(score),
        aiAvailable: true,
    };
}

function buildUnavailableEvaluation(message) {
    return {
        situation: { present: false, score: 0, feedback: "" },
        task: { present: false, score: 0, feedback: "" },
        action: { present: false, score: 0, feedback: "" },
        result: { present: false, score: 0, feedback: "" },
        missingSections: [],
        overallFeedback: message || "AI feedback is temporarily unavailable.",
        improvementSuggestions: [
            "Your answer has been saved. Try submitting again later for STAR evaluation.",
            "Review the STAR framework: Situation, Task, Action, Result.",
        ],
        score: 0,
        ratingLabel: "",
        aiAvailable: false,
    };
}

async function evaluateBehavioralAnswer({ question, answer }) {
    if (!process.env.GROQ_API_KEY) {
        return buildUnavailableEvaluation("AI feedback is temporarily unavailable.");
    }

    if (!answer || !answer.trim()) {
        throw new Error("Answer is required for evaluation");
    }

    try {
        const prompt = buildStarEvaluationPrompt({ question, answer });
        const raw = await callAIWithRetry(prompt, 3, {
            temperature: 0.3,
            max_tokens: 2048,
        });

        const parsed = cleanAndParseAIResponse(raw);
        return normalizeEvaluation(parsed);
    } catch (error) {
        console.warn("[behavioral-eval] AI evaluation failed:", error.message);
        return buildUnavailableEvaluation("AI feedback is temporarily unavailable.");
    }
}

module.exports = {
    evaluateBehavioralAnswer,
    getRatingLabel,
    buildUnavailableEvaluation,
    normalizeEvaluation,
};
