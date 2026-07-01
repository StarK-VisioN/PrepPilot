const javascriptRunner = require("../codeRunners/javascriptRunner");
const { buildTestCaseResult } = require("../codeRunners/judge");
const { DEFAULT_TIMEOUT_MS } = require("../codeRunners/shared/constants");
const { UNSUPPORTED_LANGUAGE_MESSAGE } = require("../../utils/codingLanguages");

async function runTestCases({
    language,
    code,
    functionName,
    testCases,
    expectedInputFormat = "spread",
    timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
    if (language !== "javascript") {
        const error = new Error(UNSUPPORTED_LANGUAGE_MESSAGE);
        error.statusCode = 400;
        throw error;
    }

    const results = [];

    for (const testCase of testCases) {
        const runResult = await javascriptRunner.run({
            code,
            functionName,
            input: testCase.input,
            expectedInputFormat,
            timeoutMs,
        });
        results.push(buildTestCaseResult(testCase, runResult));
    }

    const passedCount = results.filter((r) => r.passed).length;
    const totalCount = results.length;
    const runtimeMs = results.reduce((sum, r) => sum + (r.runtimeMs || 0), 0);
    const hasError = results.some((r) => r.error);
    const allPassed = passedCount === totalCount && totalCount > 0;

    let status = "Failed";
    if (hasError && passedCount === 0) {
        status = "Error";
    } else if (allPassed) {
        status = "Accepted";
    }

    return {
        status,
        passedCount,
        totalCount,
        failedCount: totalCount - passedCount,
        results,
        runtimeMs,
        language: "javascript",
    };
}

async function checkRuntime() {
    return javascriptRunner.checkRuntime();
}

module.exports = {
    runTestCases,
    checkRuntime,
};
