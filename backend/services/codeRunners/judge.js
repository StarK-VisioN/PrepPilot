const { judgeOutputs } = require("../../utils/outputComparer");

function buildTestCaseResult(testCase, runResult) {
    const meta = {
        isHidden: testCase.isHidden === true,
        type: testCase.type || (testCase.isHidden ? "hidden" : "visible"),
    };

    if (!runResult.success) {
        return {
            label: testCase.label || "",
            passed: false,
            input: testCase.input,
            expected: testCase.expected,
            actual: null,
            error: runResult.error || "Execution failed",
            runtimeMs: runResult.runtimeMs || 0,
            stderr: runResult.stderr || "",
            stdout: runResult.stdout || "",
            ...meta,
        };
    }

    const { passed, normalizedActual, normalizedExpected } = judgeOutputs(
        runResult.output,
        testCase.expected,
        { label: testCase.label }
    );

    return {
        label: testCase.label || "",
        passed,
        input: testCase.input,
        expected: testCase.expected,
        actual: runResult.output,
        normalizedActual,
        normalizedExpected,
        error: null,
        runtimeMs: runResult.runtimeMs || 0,
        stderr: runResult.stderr || "",
        stdout: runResult.stdout || "",
        ...meta,
    };
}

module.exports = {
    buildTestCaseResult,
};
