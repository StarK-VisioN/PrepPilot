function buildRecommendationsPrompt({
    scores,
    weakTopics,
    strongTopics,
    goals,
    summary,
    resumeAnalysis,
    weaknessFoundation,
}) {
    const resumeSection = resumeAnalysis
        ? `
Resume Analysis (foundation: ${weaknessFoundation || "none"}):
- ATS Score: ${resumeAnalysis.atsScore}/100
- Role Fit: ${resumeAnalysis.roleFit?.score ?? 0}/100
- Strengths: ${(resumeAnalysis.strengths || []).join(", ") || "None"}
- Resume Weaknesses: ${(resumeAnalysis.weaknesses || []).join(", ") || "None"}
- Missing Skills: ${(resumeAnalysis.missingSkills || []).join(", ") || "None"}
- Recommended Topics: ${(resumeAnalysis.recommendedTopics || []).join(", ") || "None"}
`
        : "\nResume Analysis: Not uploaded yet. Recommend starting with resume upload if user has little activity.\n";

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
${resumeSection}
Weak Topics: ${weakTopics.map((t) => `${t.topic} (${t.weakScore}% weak)`).join(", ") || "None yet"}
Strong Topics: ${strongTopics.map((t) => t.topic).join(", ") || "None yet"}

Goals:
- Target Company: ${goals?.targetCompany || "Not set"}
- Target Role: ${goals?.targetRole || "Software Engineer"}
- Skill Level: ${goals?.skillLevel || "Intermediate"}

Prioritize resume gaps when platform activity is low. Combine resume and activity insights when both exist.

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
