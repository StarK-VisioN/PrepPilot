const { runTestCases: executeTestCases } = require("./execution");
const { resolveExecutableLanguage } = require("../utils/codingLanguages");

const DEFAULT_TIMEOUT_MS = 5000;

async function runTestCases({
    language,
    code,
    functionName,
    testCases,
    expectedInputFormat = "spread",
    timeoutMs = DEFAULT_TIMEOUT_MS,
    mode = "run",
}) {
    const resolved = resolveExecutableLanguage(language);
    if (!resolved.ok) {
        throw new Error(resolved.message);
    }

    const result = await executeTestCases({
        language: resolved.language,
        code,
        functionName,
        testCases,
        expectedInputFormat,
        timeoutMs,
    });

    return {
        ...result,
        mode,
    };
}

module.exports = {
    runTestCases,
    DEFAULT_TIMEOUT_MS,
};
