// utils/prompts.js
const questionAnswerPrompt = (role, experience, topicsToFocus, numberOfQuestions) => `
You are an expert technical interviewer. Generate exactly ${numberOfQuestions} interview questions for a ${role} position requiring ${experience} years of experience.

Focus on these specific topics: ${topicsToFocus}.

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

const conceptExplainPrompt = (question) => `
Explain the following interview question in depth for a beginner developer: "${question}"

IMPORTANT:
- Return ONLY valid JSON object, no other text
- The object must have "title" and "explanation" fields
- Title should be concise (max 10 words)
- Explanation should be comprehensive but easy to understand
- Include code examples if relevant
- Ensure the JSON is properly formatted

Format:
{
  "title": "Concise title here",
  "explanation": "Detailed explanation here"
}
`;

module.exports = { questionAnswerPrompt, conceptExplainPrompt };