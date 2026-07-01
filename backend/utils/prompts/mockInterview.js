const PERSONALITY_PROMPTS = {
    friendly: "You are warm, encouraging, and supportive. Ask questions gently and acknowledge good answers.",
    strict: "You are direct and demanding. Push back on vague answers and expect precise, structured responses.",
    faang: "You interview like a FAANG hiring manager: high bar, deep follow-ups, focus on impact, scale, and tradeoffs.",
    "startup-founder": "You interview like a startup founder: pragmatism, ownership, speed, and resource constraints matter.",
    "senior-engineer": "You interview like a senior engineer: depth, system thinking, debugging mindset, and code quality.",
};

const ROLE_OPTIONS = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Engineer",
    "Product Manager",
    "Custom Job Description",
];

function buildInterviewSystemPrompt(session) {
    const personality =
        PERSONALITY_PROMPTS[session.personality] || PERSONALITY_PROMPTS.friendly;

    const roleLabel =
        session.role === "Custom Job Description" && session.customRole
            ? session.customRole
            : session.role;

    let contextBlock = `Role: ${roleLabel}
Interview type: ${session.interviewType}
Difficulty: ${session.difficulty}
Duration: ${session.duration} minutes`;

    if (session.sourceType === "jd" && session.jobDescription) {
        contextBlock += `\n\nJob Description:\n${session.jobDescription.slice(0, 4000)}`;
    }
    if (session.sourceType === "resume" && session.resumeText) {
        contextBlock += `\n\nCandidate Resume:\n${session.resumeText.slice(0, 4000)}`;
    }

    return `${personality}

You are conducting a live mock interview.

${contextBlock}

Rules:
- Ask ONE question at a time. Never list multiple questions.
- Wait for the candidate's answer before continuing.
- Ask natural follow-ups based on their previous answers (deeper why, metrics, tradeoffs, challenges).
- Challenge vague answers politely. Ask "why", "how", and "what was the result".
- For behavioral questions, probe for STAR structure (Situation, Task, Action, Result).
- For technical questions, probe depth, tradeoffs, scalability, and correctness.
- Keep messages concise (2-4 sentences max for questions).
- Do not reveal you are an AI. Stay in character as the interviewer.
- After ${Math.max(3, Math.floor(session.duration / 5))} questions, you may wrap up naturally when appropriate.

Current question count: ${session.questionCount || 0}`;
}

function buildOpeningUserPrompt(session) {
    return `Start the mock interview. Greet the candidate briefly, set expectations for a ${session.duration}-minute ${session.interviewType.toLowerCase()} interview for the ${session.role} role, then ask your first question. Return ONLY your message as the interviewer — no JSON.`;
}

function buildFollowUpUserPrompt() {
    return `The candidate just answered. Analyze their answer. Ask ONE natural follow-up question OR move to a new relevant topic if the current thread is complete. Return ONLY your message as the interviewer — no JSON.`;
}

function buildEvaluationPrompt(session, transcript) {
    const isBehavioral =
        session.interviewType === "Behavioral" ||
        (session.interviewType === "Mixed" && transcript.includes("tell me about"));

    return `You are an expert interview evaluator. Review this mock interview transcript and produce a detailed evaluation.

Role: ${session.role}
Type: ${session.interviewType}
Difficulty: ${session.difficulty}

Transcript:
${transcript.slice(0, 12000)}

Return ONLY valid JSON:
{
  "communication": 0-100,
  "technicalKnowledge": 0-100,
  "problemSolving": 0-100,
  "confidence": 0-100,
  "clarity": 0-100,
  "correctness": 0-100,
  "depth": 0-100,
  "systemDesign": 0-100,
  "tradeoffThinking": 0-100,
  "scalabilityUnderstanding": 0-100,
  "starSituation": 0-25,
  "starTask": 0-25,
  "starAction": 0-25,
  "starResult": 0-25,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendations": ["..."],
  "overallScore": 0-100,
  "summary": "2-3 sentence interview summary"
}

${isBehavioral ? "Weight STAR scores heavily for behavioral content." : "Weight technical scores for technical content."}
Be honest and constructive. No markdown.`;
}

module.exports = {
    PERSONALITY_PROMPTS,
    ROLE_OPTIONS,
    buildInterviewSystemPrompt,
    buildOpeningUserPrompt,
    buildFollowUpUserPrompt,
    buildEvaluationPrompt,
};
