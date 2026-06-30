const { callAIWithRetry, cleanAndParseAIResponse } = require("./aiService");
const { resumeExtractPrompt, jdExtractPrompt } = require("../utils/prompts/extract");

async function extractResumeData(parsedText) {
    const prompt = resumeExtractPrompt(parsedText);
    const rawText = await callAIWithRetry(prompt, 2, { max_tokens: 1536 });
    const data = cleanAndParseAIResponse(rawText);

    return {
        role: data.role || "",
        experience: data.experience ? String(data.experience) : "",
        skills: Array.isArray(data.skills) ? data.skills : [],
        technologies: Array.isArray(data.technologies) ? data.technologies : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
        requirements: [],
        summary: data.summary || "",
    };
}

async function extractJdData(parsedText) {
    const prompt = jdExtractPrompt(parsedText);
    const rawText = await callAIWithRetry(prompt, 2, { max_tokens: 1536 });
    const data = cleanAndParseAIResponse(rawText);

    return {
        role: data.role || "",
        experience: data.experience ? String(data.experience) : "",
        skills: Array.isArray(data.skills) ? data.skills : [],
        technologies: Array.isArray(data.technologies) ? data.technologies : [],
        projects: [],
        responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        summary: data.summary || "",
    };
}

module.exports = {
    extractResumeData,
    extractJdData,
};
