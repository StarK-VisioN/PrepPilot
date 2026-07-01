const { callAIWithRetry, cleanAndParseAIResponse } = require("./aiService");
const { buildRecommendationsPrompt } = require("../utils/prompts/analytics");

function buildRuleBasedRecommendations({ scores, weakTopics, summary }) {
    const nextSteps = [];
    const studyRecommendations = [];
    const nextTopics = weakTopics.slice(0, 5).map((t) => t.topic);

    if ((summary.coding?.challengesSolved || 0) < 5) {
        nextSteps.push("Solve 5 Array coding challenges");
        studyRecommendations.push("Start with easy Array and String problems on the coding simulator");
    }
    if ((summary.behavioral?.totalAttempts || 0) < 3) {
        nextSteps.push("Practice 3 STAR behavioral responses");
        studyRecommendations.push("Focus on structuring answers with Situation, Task, Action, Result");
    }
    if ((summary.mock?.completed || 0) < 1) {
        nextSteps.push("Take a 30-minute mock interview");
    }
    if (scores.behavioralScore < 60) {
        studyRecommendations.push("Practice behavioral questions in Leadership and Communication categories");
    }
    if (scores.codingScore < 60) {
        studyRecommendations.push("Revise fundamentals: Arrays, Strings, and Hash Tables");
    }

    for (const weak of weakTopics.slice(0, 3)) {
        nextSteps.push(`Improve ${weak.topic} (current: ${weak.averageScore}%)`);
    }

    if (nextSteps.length === 0) {
        nextSteps.push("Maintain momentum with mixed practice across all modules");
    }

    return {
        studyRecommendations: studyRecommendations.length
            ? studyRecommendations
            : ["Keep practicing across coding, behavioral, and mock interview modules"],
        nextTopics: nextTopics.length ? nextTopics : ["Arrays", "Strings", "Communication"],
        suggestedCodingChallenges: nextTopics
            .filter((t) => !["Communication", "Leadership", "STAR Responses"].includes(t))
            .slice(0, 3)
            .map((t) => `Practice ${t} challenges`),
        suggestedMockInterviews: [
            scores.communicationScore < 70
                ? "30-min Behavioral mock interview"
                : "45-min Mixed technical + behavioral mock interview",
        ],
        suggestedBehavioralQuestions: [
            "Tell me about a time you demonstrated leadership",
            "Describe a challenging project and your role",
        ],
        nextSteps,
        aiAvailable: false,
    };
}

async function generateRecommendations(context) {
    const fallback = buildRuleBasedRecommendations(context);

    if (!process.env.GROQ_API_KEY) {
        return fallback;
    }

    try {
        const prompt = buildRecommendationsPrompt(context);
        const raw = await callAIWithRetry(prompt, 2, { temperature: 0.4, max_tokens: 2048 });
        const parsed = cleanAndParseAIResponse(raw);

        return {
            studyRecommendations: parsed.studyRecommendations || fallback.studyRecommendations,
            nextTopics: parsed.nextTopics || fallback.nextTopics,
            suggestedCodingChallenges:
                parsed.suggestedCodingChallenges || fallback.suggestedCodingChallenges,
            suggestedMockInterviews:
                parsed.suggestedMockInterviews || fallback.suggestedMockInterviews,
            suggestedBehavioralQuestions:
                parsed.suggestedBehavioralQuestions || fallback.suggestedBehavioralQuestions,
            nextSteps: parsed.nextSteps || fallback.nextSteps,
            aiAvailable: true,
        };
    } catch (error) {
        console.warn("[analytics] AI recommendations failed:", error.message);
        return fallback;
    }
}

module.exports = { generateRecommendations, buildRuleBasedRecommendations };
