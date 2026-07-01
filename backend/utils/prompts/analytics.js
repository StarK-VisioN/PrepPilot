function buildRecommendationsPrompt({ scores, weakTopics, strongTopics, goals, summary }) {
    return `You are an expert interview coach. Generate personalized study recommendations.

User Performance:
- Overall Readiness: ${scores.overallReadiness}/100 (${scores.readinessLabel})
- Technical: ${scores.technicalScore}/100
- Coding: ${scores.codingScore}/100
- Behavioral: ${scores.behavioralScore}/100
- Communication: ${scores.communicationScore}/100

Activity:
- Coding submissions: ${summary.coding?.totalSubmissions || 0}, solved: ${summary.coding?.challengesSolved || 0}
- Behavioral attempts: ${summary.behavioral?.totalAttempts || 0}
- Mock interviews completed: ${summary.mock?.completed || 0}
- Phase 1 questions: ${summary.session?.totalQuestions || 0}

Weak Topics: ${weakTopics.map((t) => `${t.topic} (${t.weakScore}% weak)`).join(", ") || "None yet"}
Strong Topics: ${strongTopics.map((t) => t.topic).join(", ") || "None yet"}

Goals:
- Target Company: ${goals?.targetCompany || "Not set"}
- Target Role: ${goals?.targetRole || "Software Engineer"}
- Skill Level: ${goals?.skillLevel || "Intermediate"}

Return ONLY valid JSON:
{
  "studyRecommendations": ["..."],
  "nextTopics": ["..."],
  "suggestedCodingChallenges": ["..."],
  "suggestedMockInterviews": ["..."],
  "suggestedBehavioralQuestions": ["..."],
  "nextSteps": ["..."]
}

Provide 3-5 items per array. Be specific and actionable. No markdown.`;
}

module.exports = { buildRecommendationsPrompt };
