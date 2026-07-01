const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    // Avoid double retries — callAIWithRetry handles backoff with retry-after
    maxRetries: 0,
});

function getGroqErrorText(error) {
    if (error?.error?.message) return error.error.message;

    const text = error?.message || "";
    const jsonMatch = text.match(/\{[\s\S]*\}$/);
    if (jsonMatch) {
        try {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed?.error?.message) return parsed.error.message;
        } catch {
            // use raw message
        }
    }
    return text;
}

function parseGroqRateLimitInfo(error) {
    const raw = getGroqErrorText(error);
    let retryAfterSeconds = null;

    const header = error?.headers?.["retry-after"];
    if (header) {
        const seconds = parseInt(header, 10);
        if (!Number.isNaN(seconds) && seconds > 0) {
            retryAfterSeconds = seconds;
        }
    }

    const tryAgainMatch = raw.match(/try again in\s+(?:(\d+)m)?(\d+(?:\.\d+)?)s/i);
    if (tryAgainMatch) {
        const minutes = parseInt(tryAgainMatch[1] || "0", 10);
        const seconds = parseFloat(tryAgainMatch[2] || "0");
        retryAfterSeconds = Math.ceil(minutes * 60 + seconds);
    }

    return {
        retryAfterSeconds,
        isDaily: /tokens per day|\bTPD\b/i.test(raw),
        isPerMinute: /tokens per minute|\bTPM\b/i.test(raw) || /requests per minute|\bRPM\b/i.test(raw),
        raw,
    };
}

function formatRateLimitMessage(limitInfo) {
    const wait = limitInfo.retryAfterSeconds;
    const waitText = wait
        ? wait >= 60
            ? `about ${Math.ceil(wait / 60)} minute${Math.ceil(wait / 60) === 1 ? "" : "s"}`
            : `${wait} seconds`
        : "a few minutes";

    if (limitInfo.isDaily) {
        return `You've reached today's question limit. Please try again in ${waitText}.`;
    }
    if (limitInfo.isPerMinute) {
        return `Too many requests right now. Please wait ${waitText} and try again.`;
    }
    return `We're a bit busy right now. Please wait ${waitText} and try again.`;
}

function getRetryDelayMs(error, attempt) {
    const limitInfo = parseGroqRateLimitInfo(error);
    if (limitInfo.retryAfterSeconds) {
        return Math.min(limitInfo.retryAfterSeconds * 1000, 60000);
    }
    return Math.min(2000 * Math.pow(2, attempt), 30000);
}

const MAX_INLINE_RETRY_WAIT_MS = 90_000;

async function callAIWithRetry(prompt, maxRetries = 4, options = {}) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Groq attempt ${attempt}/${maxRetries}`);

            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                temperature: options.temperature ?? 0.7,
                ...(options.max_tokens ? { max_tokens: options.max_tokens } : {}),
            });

            const content = response.choices?.[0]?.message?.content;
            if (!content || typeof content !== "string" || !content.trim()) {
                throw new Error("Empty response from AI service");
            }

            return content;
        } catch (error) {
            const status = error?.status;
            const isRetryable = status === 429 || status === 503 || status === 408;

            if (isRetryable && attempt < maxRetries) {
                const delay = getRetryDelayMs(error, attempt);

                if (delay > MAX_INLINE_RETRY_WAIT_MS) {
                    console.log(
                        `Groq rate limit requires ${Math.ceil(delay / 1000)}s wait — skipping inline retry`
                    );
                    throw error;
                }

                console.log(
                    `Groq retryable error ${status}. Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})...`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
            }

            console.error(
                `Groq request failed: status=${status ?? "unknown"}, name=${error?.name}, message=${error?.message}`
            );
            throw error;
        }
    }
}

function sanitizeJsonStringLiterals(jsonText) {
    let result = "";
    let inString = false;
    let escaped = false;

    for (let i = 0; i < jsonText.length; i++) {
        const char = jsonText[i];

        if (escaped) {
            result += char;
            escaped = false;
            continue;
        }

        if (char === "\\") {
            result += char;
            escaped = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            result += char;
            continue;
        }

        if (inString) {
            if (char === "\n") {
                result += "\\n";
                continue;
            }
            if (char === "\r") {
                continue;
            }
            if (char === "\t") {
                result += "\\t";
                continue;
            }
            const code = char.charCodeAt(0);
            if (code < 32) {
                result += `\\u${code.toString(16).padStart(4, "0")}`;
                continue;
            }
        }

        result += char;
    }

    return result;
}

function extractDeepDiveFromMalformedJson(cleanedText) {
    const titleMatch = cleanedText.match(/"title"\s*:\s*"((?:\\.|[^"\\])*)"/);
    const explanationMatch = cleanedText.match(/"explanation"\s*:\s*"/);

    if (!explanationMatch) {
        return null;
    }

    const valueStart = explanationMatch.index + explanationMatch[0].length;
    let explanation = cleanedText.slice(valueStart);

    // Trim trailing JSON closure if present
    explanation = explanation.replace(/"\s*}\s*$/, "");

    // Unescape common JSON escapes when recovering from malformed output
    explanation = explanation
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\")
        .trim();

    if (!explanation) {
        return null;
    }

    let title = "Deep Dive Guide";
    if (titleMatch) {
        title = titleMatch[1]
            .replace(/\\n/g, "\n")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, "\\");
    }

    return { title, explanation };
}

function stripMarkdownFences(text) {
    return text
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .replace(/```(?:json)?/gi, "")
        .trim();
}

function extractJsonBounds(text) {
    const trimmed = text.trim();

    const startObj = trimmed.indexOf("{");
    const endObj = trimmed.lastIndexOf("}");
    const startArr = trimmed.indexOf("[");
    const endArr = trimmed.lastIndexOf("]");

    const hasObject = startObj !== -1 && endObj > startObj;
    const hasArray = startArr !== -1 && endArr > startArr;

    if (hasObject && hasArray) {
        if (startObj <= startArr) {
            return trimmed.slice(startObj, endObj + 1);
        }
        return trimmed.slice(startArr, endArr + 1);
    }

    if (hasObject) {
        return trimmed.slice(startObj, endObj + 1);
    }

    if (hasArray) {
        return trimmed.slice(startArr, endArr + 1);
    }

    return trimmed;
}

function removeTrailingCommas(jsonText) {
    return jsonText.replace(/,\s*([}\]])/g, "$1");
}

function tryParseJson(candidate) {
    return JSON.parse(candidate);
}

function repairAndParseJson(cleanedText) {
    const candidates = [
        cleanedText,
        extractJsonBounds(cleanedText),
        removeTrailingCommas(cleanedText),
        removeTrailingCommas(extractJsonBounds(cleanedText)),
        sanitizeJsonStringLiterals(cleanedText),
        sanitizeJsonStringLiterals(extractJsonBounds(cleanedText)),
        removeTrailingCommas(sanitizeJsonStringLiterals(extractJsonBounds(cleanedText))),
    ];

    const unique = [...new Set(candidates.map((c) => c.trim()).filter(Boolean))];

    for (const candidate of unique) {
        try {
            return tryParseJson(candidate);
        } catch {
            // try next repair strategy
        }
    }

    return null;
}

function cleanAndParseAIResponse(rawText) {
    if (!rawText || typeof rawText !== "string") {
        throw new Error("Invalid response from AI service");
    }

    let cleanedText = stripMarkdownFences(rawText);
    cleanedText = extractJsonBounds(cleanedText);

    if (!cleanedText.startsWith("[") && !cleanedText.startsWith("{")) {
        console.error(
            "Response does not appear to be JSON:",
            cleanedText.substring(0, 300)
        );
        throw new Error("Invalid response format from AI");
    }

    const parsed = repairAndParseJson(cleanedText);
    if (parsed !== null) {
        return parsed;
    }

    const deepDive = extractDeepDiveFromMalformedJson(cleanedText);
    if (deepDive) {
        console.warn("Recovered deep-dive content from malformed JSON response");
        return deepDive;
    }

    console.error("JSON parsing failed. Raw text (first 300 chars):", cleanedText.substring(0, 300));
    throw new Error("Failed to parse AI response");
}

function normalizeTopicQuestion(item) {
    if (!item || typeof item !== "object") return null;

    const question = typeof item.question === "string" ? item.question.trim() : "";
    let answer = typeof item.answer === "string" ? item.answer.trim() : "";

    answer = answer
        .replace(/```[\s\S]*?```/g, (block) => block.replace(/```\w*\n?/g, "").replace(/```/g, "").trim())
        .replace(/`/g, "'");

    if (!question || !answer) return null;

    return {
        question,
        answer,
        difficulty: item.difficulty || undefined,
        type: item.type || undefined,
    };
}

function parseTopicQuestionsResponse(rawText) {
    const parsed = cleanAndParseAIResponse(rawText);

    if (!Array.isArray(parsed)) {
        throw new Error("Invalid topic questions response format");
    }

    const questions = parsed.map(normalizeTopicQuestion).filter(Boolean);

    if (questions.length === 0) {
        throw new Error("No valid topic questions in AI response");
    }

    return questions;
}

function parseDeepDiveResponse(rawText) {
    const parsed = cleanAndParseAIResponse(rawText);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return {
            title: parsed.title || "Deep Dive Guide",
            explanation: parsed.explanation || "",
        };
    }

    throw new Error("Invalid deep dive response format");
}

function isParseOrInvalidAIError(error) {
    const msg = (error.message || "").toLowerCase();
    return (
        msg.includes("json") ||
        msg.includes("parse") ||
        msg.includes("invalid response") ||
        msg.includes("invalid topic questions") ||
        msg.includes("no valid topic questions")
    );
}

function handleAIError(error, res, defaultMessage, options = {}) {
    console.error(`Error in ${defaultMessage}:`, error);

    if (error.status === 503) {
        return res.status(503).json({
            message: "Our AI service is temporarily busy. Please try again in a few moments.",
            isRetryable: true,
            retryAfter: 30,
        });
    }

    if (error.status === 429) {
        const limitInfo = parseGroqRateLimitInfo(error);
        return res.status(429).json({
            message: formatRateLimitMessage(limitInfo),
            isRetryable: true,
            retryAfter: limitInfo.retryAfterSeconds || 60,
        });
    }

    if (isParseOrInvalidAIError(error)) {
        return res.status(422).json({
            message:
                options.userMessage ||
                "The AI service returned an invalid response. Please try again.",
            isRetryable: true,
        });
    }

    return res.status(500).json({
        message: defaultMessage,
        error: process.env.NODE_ENV === "production" ? "Internal server error" : error.message,
    });
}

async function callAIWithMessages(messages, maxRetries = 4, options = {}) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages,
                temperature: options.temperature ?? 0.7,
                ...(options.max_tokens ? { max_tokens: options.max_tokens } : {}),
            });

            const content = response.choices?.[0]?.message?.content;
            if (!content || typeof content !== "string" || !content.trim()) {
                throw new Error("Empty response from AI service");
            }

            return content.trim();
        } catch (error) {
            const status = error?.status;
            const isRetryable = status === 429 || status === 503 || status === 408;

            if (isRetryable && attempt < maxRetries) {
                const delay = getRetryDelayMs(error, attempt);
                if (delay > MAX_INLINE_RETRY_WAIT_MS) throw error;
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
}

module.exports = {
    callAIWithRetry,
    callAIWithMessages,
    cleanAndParseAIResponse,
    parseDeepDiveResponse,
    parseTopicQuestionsResponse,
    handleAIError,
    parseGroqRateLimitInfo,
    formatRateLimitMessage,
};
