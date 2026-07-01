function buildStarEvaluationPrompt({ question, answer }) {
    const questionText =
        typeof question === "string"
            ? question
            : question?.question || question?.title || "Behavioral interview question";

    return `You are an expert behavioral interview coach evaluating answers using the STAR framework.

STAR Framework:
- Situation (0-25): Did the candidate set clear context (where, when, who)?
- Task (0-25): Did they explain their specific responsibility or goal?
- Action (0-25): Did they describe concrete steps THEY took (use "I", not "we")?
- Result (0-25): Did they share measurable outcomes, impact, or lessons learned?

Question:
${questionText}

Candidate Answer:
${answer}

Evaluate strictly. Score each STAR section 0-25. Total score is sum (0-100).

Return ONLY valid JSON with this exact structure:
{
  "situation": { "present": true, "score": 20, "feedback": "..." },
  "task": { "present": true, "score": 18, "feedback": "..." },
  "action": { "present": true, "score": 22, "feedback": "..." },
  "result": { "present": false, "score": 8, "feedback": "..." },
  "missingSections": ["Result"],
  "overallFeedback": "2-3 sentence summary",
  "improvementSuggestions": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3"],
  "score": 68
}

Rules:
- "present" is true only if the section is clearly addressed in the answer.
- "missingSections" lists STAR parts that are absent or too vague.
- improvementSuggestions must be actionable and specific to this answer.
- Be constructive but honest. Do not inflate scores.
- No markdown, no code fences, only JSON.`;
}

module.exports = {
    buildStarEvaluationPrompt,
};
