const { getCompanyStyle } = require("../companies");

const JSON_ARRAY_FORMAT = `
IMPORTANT:
- Return ONLY valid JSON array, no other text
- Each object must have "question" and "answer" fields
- Answers should be detailed but beginner-friendly
- Include code examples where appropriate
- Ensure the JSON is properly formatted

Format:
[
  {
    "question": "Question text here?",
    "answer": "Detailed answer here with code examples if needed."
  }
]
`;

const TOPIC_QUESTION_JSON_FORMAT = `
CRITICAL JSON RULES — follow exactly:
- Return ONLY a valid JSON array. No markdown, no prose, no \`\`\`json fences, no text before or after the array.
- Every string value must be valid JSON: use \\n for line breaks, escape double quotes as \\", never use literal newlines inside strings.
- Do NOT use markdown code blocks, triple backticks, or JSX/HTML in any answer.
- If code is required, explain it in plain text without markdown code blocks (e.g. "Use getServerSideProps to fetch data on each request").
- Keep each answer concise: 2-4 sentences maximum.

Each object must have exactly these fields:
- "question" (string)
- "answer" (string, plain text only)
- "difficulty" ("Beginner" | "Intermediate" | "Advanced")
- "type" ("Conceptual" | "Practical" | "Scenario")

Format:
[
  {
    "question": "What is X?",
    "answer": "Plain text answer without markdown.",
    "difficulty": "Beginner",
    "type": "Conceptual"
  }
]
`;

const questionAnswerPrompt = (
    role,
    experience,
    topicsToFocus,
    numberOfQuestions,
    company = "generic",
    customCompanyName = ""
) => {
    const companyStyle = getCompanyStyle(company, customCompanyName);

    return `
You are an expert technical interviewer. Generate exactly ${numberOfQuestions} interview questions for a ${role} position requiring ${experience} years of experience.

Focus on these specific topics: ${topicsToFocus}.

Company interview style: ${companyStyle}

${JSON_ARRAY_FORMAT}
`;
};

const resumeQuestionPrompt = ({
    role,
    experience,
    topicsToFocus,
    numberOfQuestions,
    company,
    customCompanyName = "",
    resumeText,
    extractedData,
}) => {
    const companyStyle = getCompanyStyle(company, customCompanyName);
    const skills = extractedData?.skills?.join(", ") || topicsToFocus;
    const technologies = extractedData?.technologies?.join(", ") || "";
    const projects = extractedData?.projects?.join("; ") || "";

    return `
You are an expert technical interviewer. Generate exactly ${numberOfQuestions} interview questions tailored to THIS candidate's resume.

Candidate role: ${role}
Experience: ${experience} years
Key skills: ${skills}
Technologies from resume: ${technologies}
Projects: ${projects}

Company interview style: ${companyStyle}

Rules:
- Questions MUST be based on technologies, skills, and projects listed on the resume
- Example: if resume mentions Docker, ask about Docker volumes; if Redis, ask about Redis Pub/Sub; if Next.js, ask about Server Components
- Mix technical depth with practical scenarios from their background
- Include some behavioral questions tied to their listed experience

Resume excerpt:
"""
${resumeText.slice(0, 8000)}
"""

${JSON_ARRAY_FORMAT}
`;
};

const jdQuestionPrompt = ({
    role,
    experience,
    topicsToFocus,
    numberOfQuestions,
    company,
    customCompanyName = "",
    jdText,
    extractedData,
}) => {
    const companyStyle = getCompanyStyle(company, customCompanyName);
    const requirements = extractedData?.requirements?.join(", ") || "";
    const responsibilities = extractedData?.responsibilities?.join("; ") || "";
    const skills = extractedData?.skills?.join(", ") || topicsToFocus;

    return `
You are an expert technical interviewer. Generate exactly ${numberOfQuestions} interview questions tailored to THIS job description.

Target role: ${role}
Required experience: ${experience} years
Required skills: ${skills}
Key requirements: ${requirements}
Role responsibilities: ${responsibilities}

Company interview style: ${companyStyle}

Rules:
- Questions must align with JD requirements, responsibilities, and required skills
- Include technical skills assessment questions
- Include behavioral expectations from the JD
- Reflect company/role-specific expectations

Job Description:
"""
${jdText.slice(0, 8000)}
"""

${JSON_ARRAY_FORMAT}
`;
};

const combinedQuestionPrompt = ({
    role,
    experience,
    numberOfQuestions,
    company,
    customCompanyName = "",
    resumeText,
    jdText,
    resumeExtract,
    jdExtract,
}) => {
    const companyStyle = getCompanyStyle(company, customCompanyName);

    return `
You are an expert technical interviewer. Generate exactly ${numberOfQuestions} interview questions by matching the candidate's resume against the job description.

Target role: ${role}
Experience: ${experience} years
Company interview style: ${companyStyle}

Candidate resume skills: ${resumeExtract?.skills?.join(", ") || ""}
Candidate technologies: ${resumeExtract?.technologies?.join(", ") || ""}
JD requirements: ${jdExtract?.requirements?.join(", ") || ""}
JD responsibilities: ${jdExtract?.responsibilities?.join("; ") || ""}

Rules:
- Highlight gaps between resume and JD with  gaps, and strengths
- Ask questions the interviewer would use to validate fit for this specific role
- Mix technical, behavioral, and role-responsibility questions

Resume:
"""
${resumeText.slice(0, 4000)}
"""

Job Description:
"""
${jdText.slice(0, 4000)}
"""

${JSON_ARRAY_FORMAT}
`;
};

const conceptExplainPrompt = (question, answer = "", role = "") => {
    const answerBlock = answer
        ? `
Short model answer already shown to the candidate (go significantly deeper — do not repeat this verbatim):
"""
${answer.slice(0, 3000)}
"""
`
        : "";

    const roleBlock = role ? `Target role: ${role}\n` : "";

    return `
You are an expert interview coach and senior engineer. Create a comprehensive deep-dive study guide for the interview question below.

${roleBlock}Interview question:
"${question}"
${answerBlock}
IMPORTANT:
- Return ONLY a valid JSON object, no markdown fences or extra text
- The object must have exactly "title" and "explanation" fields
- "title": concise topic title (max 8 words)
- "explanation": a thorough markdown guide (aim for 900–1400 words). Use clear ## section headings and bullet lists where helpful.
- CRITICAL: The entire response must be valid JSON. Inside "explanation", use \\n for every line break — never insert real line breaks inside the JSON string value

Required sections in "explanation" (use these exact headings):
## Overview
## Key Concepts You Must Know
## Deep Dive
## How to Answer in an Interview
## Examples & Code Snippets
## Common Mistakes to Avoid
## Likely Follow-Up Questions
## Quick Recap

Guidelines:
- Be practical and interview-focused, not textbook-only
- Expand far beyond the short model answer with real depth
- Include code examples when the topic is technical
- Use simple language but do not oversimplify
- Ensure valid JSON (escape quotes and newlines inside the explanation string)

Format:
{
  "title": "Concise title here",
  "explanation": "## Overview\\n\\nYour markdown content here..."
}
`;
};

const topicQuestionPrompt = (
    topic,
    role,
    experience,
    company = "generic",
    customCompanyName = "",
    numberOfQuestions = 8,
    excludeQuestions = []
) => {
    const companyStyle = getCompanyStyle(company, customCompanyName);
    const excludeBlock =
        excludeQuestions.length > 0
            ? `
IMPORTANT — Do NOT repeat or rephrase these existing questions:
${excludeQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Generate completely NEW and different questions from the list above.
`
            : "";

    return `
You are an expert technical interviewer. Generate exactly ${numberOfQuestions} interview questions focused ONLY on "${topic}" for a ${role} candidate with ${experience} years of experience.

Company interview style: ${companyStyle}
${excludeBlock}
Requirements:
- ALL questions must be specifically about ${topic} — no unrelated topics
- Include a balanced mix of Beginner, Intermediate, and Advanced difficulty
- Include Conceptual, Practical, and Scenario question types
- Answers must be short, clear, and interview-ready (2-4 sentences each)

${TOPIC_QUESTION_JSON_FORMAT}
`;
};

module.exports = {
    questionAnswerPrompt,
    resumeQuestionPrompt,
    jdQuestionPrompt,
    combinedQuestionPrompt,
    conceptExplainPrompt,
    topicQuestionPrompt,
};
