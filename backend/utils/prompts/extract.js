const resumeExtractPrompt = (resumeText) => `
You are an expert resume parser. Extract structured data from the resume below.

CRITICAL:
- Return ONLY a single valid JSON object (not an array, not markdown, no extra text)
- Keep each array to at most 12 concise items
- Use empty strings or empty arrays when data is not found

Resume:
"""
${resumeText.slice(0, 12000)}
"""

Format:
{
  "role": "Most recent or target job title",
  "experience": "Total years of experience as a number string e.g. 3",
  "skills": ["skill1", "skill2"],
  "technologies": ["Docker", "Redis", "Next.js"],
  "projects": ["Brief project name or description"],
  "responsibilities": ["Key responsibility from work history"],
  "summary": "One sentence candidate summary"
}
`;

const jdExtractPrompt = (jdText) => `
You are an expert job description analyzer. Extract structured hiring requirements from the JD below.

CRITICAL:
- Return ONLY a single valid JSON object (not an array, not markdown, no extra text)
- Keep each array to at most 12 concise items
- Use empty strings or empty arrays when data is not found

Job Description:
"""
${jdText.slice(0, 12000)}
"""

Format (JSON object only):
{
  "role": "Job title",
  "experience": "Required years of experience as a number string e.g. 5",
  "skills": ["required skill1", "required skill2"],
  "technologies": ["tech stack items"],
  "responsibilities": ["key responsibility from JD"],
  "requirements": ["must-have requirement"],
  "summary": "One sentence role summary"
}
`;

module.exports = { resumeExtractPrompt, jdExtractPrompt };
