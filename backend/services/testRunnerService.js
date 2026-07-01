const CodingChallenge = require("../models/CodingChallenge");
const { runTestCases } = require("./codeExecutionService");
const { getTestCasesForMode } = require("../utils/testCaseUtils");

async function loadChallenge(challengeId) {
    const challenge = await CodingChallenge.findOne({
        _id: challengeId,
        isActive: true,
    });

    if (!challenge) {
        const error = new Error("Challenge not found");
        error.statusCode = 404;
        throw error;
    }

    return challenge;
}

function formatRunResponse(payload) {
    const allPassed = payload.passedCount === payload.totalCount && payload.totalCount > 0;

    return {
        success: allPassed,
        passedCount: payload.passedCount,
        totalCount: payload.totalCount,
        results: payload.results,
        runtimeMs: payload.runtimeMs,
        error: payload.error || null,
        mode: payload.mode || "run",
    };
}

function formatSubmitResponse(payload) {
    const status =
        payload.status ||
        (payload.passedCount === payload.totalCount && payload.totalCount > 0
            ? "Accepted"
            : "Failed");

    return {
        status,
        passedCount: payload.passedCount,
        totalCount: payload.totalCount,
        results: payload.results,
        runtimeMs: payload.runtimeMs,
        error: payload.error || null,
        mode: "submit",
    };
}

async function runChallengeCode({ challengeId, code, language, mode = "run" }) {
    const challenge = await loadChallenge(challengeId);
    const testCases = getTestCasesForMode(challenge.testCases, mode);

    const payload = await runTestCases({
        code,
        language,
        functionName: challenge.functionName,
        expectedInputFormat: challenge.expectedInputFormat,
        testCases,
        mode,
    });

    return formatRunResponse(payload);
}

async function submitChallengeCode({ challengeId, code, language }) {
    const challenge = await loadChallenge(challengeId);
    const testCases = getTestCasesForMode(challenge.testCases, "submit");

    const payload = await runTestCases({
        code,
        language,
        functionName: challenge.functionName,
        expectedInputFormat: challenge.expectedInputFormat,
        testCases,
        mode: "submit",
    });

    return formatSubmitResponse(payload);
}

module.exports = {
    runChallengeCode,
    submitChallengeCode,
};
