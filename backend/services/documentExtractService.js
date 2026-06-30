const { callAIWithRetry, cleanAndParseAIResponse } = require("./aiService");
const { resumeExtractPrompt, jdExtractPrompt } = require("../utils/prompts/extract");

const EXTRACT_MAX_TOKENS = 3072;

function stripMarkdownFences(text) {
    return text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .replace(/```(?:json)?/gi, "")
        .trim();
}

function extractQuotedStrings(text) {
    const items = [];
    const pattern = /"((?:\\.|[^"\\])*)"/g;
    let match = pattern.exec(text);

    while (match) {
        const value = match[1]
            .replace(/\\n/g, "\n")
            .replace(/\\t/g, "\t")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, "\\")
            .trim();

        if (value.length > 1) {
            items.push(value);
        }

        match = pattern.exec(text);
    }

    return items;
}

function normalizeExtractObject(parsed, rawText) {
    if (Array.isArray(parsed)) {
        const strings = parsed.filter((item) => typeof item === "string");
        if (strings.length > 0) {
            console.warn(
                "Recovered document extract from JSON array — mapping items to skills/requirements"
            );
            return {
                role: "",
                experience: "",
                skills: strings,
                technologies: [],
                projects: [],
                responsibilities: strings,
                requirements: strings,
                summary: "",
            };
        }
    }

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
    }

    const recoveredStrings = extractQuotedStrings(stripMarkdownFences(rawText));
    if (recoveredStrings.length >= 3) {
        console.warn(
            "Recovered document extract from malformed JSON using quoted strings"
        );
        return {
            role: "",
            experience: "",
            skills: recoveredStrings,
            technologies: [],
            projects: [],
            responsibilities: recoveredStrings,
            requirements: recoveredStrings,
            summary: "",
        };
    }

    throw new Error("Failed to parse AI response");
}

function parseExtractResponse(rawText) {
    try {
        const parsed = cleanAndParseAIResponse(rawText);
        return normalizeExtractObject(parsed, rawText);
    } catch (error) {
        const recovered = normalizeExtractObject(null, rawText);
        if (recovered) {
            return recovered;
        }
        throw error;
    }
}

function mapResumeExtract(data) {
    return {
        role: data.role || "",
        experience: data.experience ? String(data.experience) : "",
        skills: Array.isArray(data.skills) ? data.skills : [],
        technologies: Array.isArray(data.technologies) ? data.technologies : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        responsibilities: Array.isArray(data.responsibilities)
            ? data.responsibilities
            : [],
        requirements: [],
        summary: data.summary || "",
    };
}

function mapJdExtract(data, parsedText) {
    const role =
        data.role ||
        (parsedText.match(/(?:role|position|title)\s*[:\-]\s*(.+)/i)?.[1] || "").trim();

    return {
        role,
        experience: data.experience ? String(data.experience) : "",
        skills: Array.isArray(data.skills) ? data.skills : [],
        technologies: Array.isArray(data.technologies) ? data.technologies : [],
        projects: [],
        responsibilities: Array.isArray(data.responsibilities)
            ? data.responsibilities
            : [],
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        summary: data.summary || "",
    };
}

async function extractResumeData(parsedText) {
    const prompt = resumeExtractPrompt(parsedText);
    const rawText = await callAIWithRetry(prompt, 2, {
        max_tokens: EXTRACT_MAX_TOKENS,
        temperature: 0.2,
    });
    const data = parseExtractResponse(rawText);
    return mapResumeExtract(data);
}

async function extractJdData(parsedText) {
    const prompt = jdExtractPrompt(parsedText);
    const rawText = await callAIWithRetry(prompt, 2, {
        max_tokens: EXTRACT_MAX_TOKENS,
        temperature: 0.2,
    });
    const data = parseExtractResponse(rawText);
    return mapJdExtract(data, parsedText);
}

module.exports = {
    extractResumeData,
    extractJdData,
};
