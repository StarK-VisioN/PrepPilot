const { MAX_OUTPUT_LENGTH } = require("./constants");

function truncateOutput(value) {
    if (typeof value === "string" && value.length > MAX_OUTPUT_LENGTH) {
        return value.slice(0, MAX_OUTPUT_LENGTH) + "...(truncated)";
    }
    return value;
}

function createSuccessResult({ output, runtimeMs, stdout = "", stderr = "" }) {
    return {
        success: true,
        output,
        error: null,
        runtimeMs,
        stderr: truncateOutput(stderr),
        stdout: truncateOutput(stdout),
    };
}

function createErrorResult({ error, runtimeMs = 0, stdout = "", stderr = "" }) {
    return {
        success: false,
        output: null,
        error: error || "Execution failed",
        runtimeMs,
        stderr: truncateOutput(stderr),
        stdout: truncateOutput(stdout),
    };
}

module.exports = {
    createSuccessResult,
    createErrorResult,
};
