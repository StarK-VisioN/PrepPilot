const { judgeOutputs } = require("../../utils/outputComparer");

function buildTestCaseResult(testCase, { actual, error = null, runtimeMs }) {
    if (error) {
        return {
            label: testCase.label || "",
            passed: false,
            input: testCase.input,
            expected: testCase.expected,
            actual: null,
            error,
            runtimeMs,
        };
    }

    const { passed, normalizedActual, normalizedExpected } = judgeOutputs(
        actual,
        testCase.expected,
        { label: testCase.label }
    );

    return {
        label: testCase.label || "",
        passed,
        input: testCase.input,
        expected: testCase.expected,
        actual,
        normalizedActual,
        normalizedExpected,
        error: null,
        runtimeMs,
    };
}

module.exports = {
    buildTestCaseResult,
};
