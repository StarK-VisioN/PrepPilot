function buildResumeAnalysisPrompt(resumeText, targetRole = "Software Engineer") {
    const truncated =
        resumeText.length > 12000 ? `${resumeText.slice(0, 12000)}\n...[truncated]` : resumeText;

    return `You are an expert ATS resume analyzer and career coach for tech interviews.

Analyze this resume for ATS compatibility, skill gaps, and interview readiness.
Target role: ${targetRole}

Resume text:
"""
${truncated}
"""

Return ONLY valid JSON with this exact structure (no markdown, no extra keys):
{
  "atsScore": 0,
  "summary": "",
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "keywordMatch": {
    "matched": [],
    "missing": []
  },
  "formattingFeedback": [],
  "roleFit": {
    "score": 0,
    "bestFitRoles": [],
    "notSuitableRoles": []
  },
  "improvementSuggestions": [],
  "recommendedTopics": [],
  "learningRoadmap": [
    {
      "week": "Week 1",
      "focus": "",
      "topics": [],
      "tasks": []
    }
  ]
}

Rules:
- atsScore and roleFit.score must be integers 0-100.
- strengths, weaknesses, missingSkills: 3-8 specific items each.
- keywordMatch: ATS-relevant technical and role keywords found vs missing for the target role.
- formattingFeedback: concrete ATS formatting issues (sections, bullets, length, keywords).
- learningRoadmap: exactly 4 weeks, each with focus, topics, and actionable tasks.
- recommendedTopics: interview prep topics to study based on gaps.
- Be specific to this resume. No generic filler.`;
}

module.exports = { buildResumeAnalysisPrompt };
