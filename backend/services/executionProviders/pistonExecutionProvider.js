console.log("[TRACE] loaded file: services/executionProviders/pistonExecutionProvider.js");

const { buildHarness } = require("./harnessBuilder");
const { getPistonRuntime } = require("./pistonRuntimeMap");
const { resolveTestArgs } = require("../codeRunners/shared/args");
const { validateCode } = require("../codeRunners/shared/security");
const { createSuccessResult, createErrorResult } = require("../codeRunners/shared/runContract");
const { buildTestCaseResult } = require("../codeRunners/judge");
const { DEFAULT_TIMEOUT_MS } = require("../codeRunners/shared/constants");

const PISTON_API_URL =
    process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston";
const PISTON_EXECUTE_URL = `${PISTON_API_URL.replace(/\/$/, "")}/execute`;
const PISTON_RUNTIMES_URL = `${PISTON_API_URL.replace(/\/$/, "")}/runtimes`;

const COMPILE_TIMEOUT_MS = 15000;

const LANGUAGE_LABELS = {
    python: "python",
    java: "java",
    cpp: "cpp",
    javascript: "JavaScript",
};

function unavailableMessage(language) {
    const label = LANGUAGE_LABELS[language] || language;
    return `Execution provider unavailable for ${label}.`;
}

function classifyPistonError({ compile, run, message }, language) {
    if (message) {
        if (/whitelist|unavailable|contact/i.test(message)) {
            return unavailableMessage(language);
        }
        return message;
    }

    if (compile && compile.code !== 0) {
        return `Compilation Error: ${(compile.stderr || compile.output || "").trim() || "Build failed"}`;
    }

    if (run) {
        if (run.signal === "SIGKILL" || run.signal === "SIGTERM") {
            return "Timeout";
        }
        if (run.code !== 0) {
            const detail = (run.stderr || run.output || "").trim();
            return detail ? `Runtime Error: ${detail}` : "Runtime Error";
        }
    }

    return "Execution failed";
}

function parseStdoutOutput(stdout) {
    const trimmed = (stdout || "").trim();
    if (!trimmed) {
        return null;
    }
    try {
        return JSON.parse(trimmed);
    } catch {
        throw new Error(`Invalid JSON output: ${trimmed.slice(0, 200)}`);
    }
}

async function executeOnPiston({ language, files, timeoutMs }) {
    const runtime = getPistonRuntime(language);
    if (!runtime) {
        throw new Error(`Unsupported Language: ${language}`);
    }

    const start = Date.now();
    const runTimeoutMs = Math.max(1000, timeoutMs || DEFAULT_TIMEOUT_MS);

    let response;
    try {
        response = await fetch(PISTON_EXECUTE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language: runtime.language,
                version: runtime.version,
                files,
                stdin: "",
                args: [],
                compile_timeout: COMPILE_TIMEOUT_MS,
                run_timeout: runTimeoutMs,
            }),
            signal: AbortSignal.timeout(COMPILE_TIMEOUT_MS + runTimeoutMs + 5000),
        });
    } catch (error) {
        if (error.name === "TimeoutError" || error.name === "AbortError") {
            return {
                success: false,
                stdout: "",
                stderr: "",
                error: "Timeout",
                runtimeMs: Date.now() - start,
            };
        }
        return {
            success: false,
            stdout: "",
            stderr: "",
            error: unavailableMessage(language),
            runtimeMs: Date.now() - start,
        };
    }

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload) {
        const message = payload?.message || `Piston request failed (${response.status})`;
        return {
            success: false,
            stdout: "",
            stderr: "",
            error: classifyPistonError({ message }, language),
            runtimeMs: Date.now() - start,
        };
    }

    if (payload.message && !payload.run) {
        return {
            success: false,
            stdout: "",
            stderr: "",
            error: classifyPistonError({ message: payload.message }, language),
            runtimeMs: Date.now() - start,
        };
    }

    const compile = payload.compile || null;
    const run = payload.run || {};
    const stdout = run.stdout || "";
    const stderr = [compile?.stderr, run.stderr].filter(Boolean).join("\n").trim();

    console.log("[PISTON] runtime:", runtime.language, runtime.version);

    if (compile && compile.code !== 0) {
        return {
            success: false,
            stdout,
            stderr,
            error: classifyPistonError({ compile, run }, language),
            runtimeMs: Date.now() - start,
        };
    }

    if (run.signal === "SIGKILL" || run.signal === "SIGTERM") {
        return {
            success: false,
            stdout,
            stderr,
            error: "Timeout",
            runtimeMs: Date.now() - start,
        };
    }

    if (run.code !== 0) {
        return {
            success: false,
            stdout,
            stderr,
            error: classifyPistonError({ compile, run }, language),
            runtimeMs: Date.now() - start,
        };
    }

    try {
        const output = parseStdoutOutput(stdout);
        return {
            success: true,
            output,
            stdout,
            stderr,
            error: null,
            runtimeMs: Date.now() - start,
        };
    } catch (error) {
        return {
            success: false,
            stdout,
            stderr,
            error: error.message || "Runtime Error",
            runtimeMs: Date.now() - start,
        };
    }
}

async function runSingleTest({
    language,
    code,
    functionName,
    input,
    expectedInputFormat,
    timeoutMs,
}) {
    console.log("[TRACE] pistonExecutionProvider.runSingleTest() language:", language);
    validateCode(code, language);
    const args = resolveTestArgs(input, expectedInputFormat);
    const { files } = buildHarness(language, { userCode: code, functionName, args });
    const result = await executeOnPiston({ language, files, timeoutMs });

    if (!result.success) {
        return createErrorResult({
            error: result.error,
            runtimeMs: result.runtimeMs,
            stdout: result.stdout,
            stderr: result.stderr,
        });
    }

    return createSuccessResult({
        output: result.output,
        runtimeMs: result.runtimeMs,
        stdout: result.stdout,
        stderr: result.stderr,
    });
}

async function runTestCases({
    language,
    code,
    functionName,
    testCases,
    expectedInputFormat = "spread",
    timeoutMs = DEFAULT_TIMEOUT_MS,
}) {
    const results = [];

    for (const testCase of testCases) {
        const runResult = await runSingleTest({
            language,
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
        language,
    };
}

async function checkRuntime(language) {
    const runtime = getPistonRuntime(language);
    if (!runtime) {
        return { available: false, message: `Unsupported Language: ${language}` };
    }

    try {
        const response = await fetch(PISTON_RUNTIMES_URL, {
            signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) {
            return {
                available: false,
                message: unavailableMessage(language),
            };
        }

        const runtimes = await response.json();
        const match = runtimes.some(
            (entry) =>
                entry.language === runtime.language && entry.version === runtime.version
        );

        if (!match) {
            return {
                available: false,
                message: `Piston runtime not found for ${language}`,
            };
        }

        const executeCheck = await checkExecuteAvailability();
        if (!executeCheck.available) {
            return executeCheck;
        }

        return { available: true, message: null };
    } catch {
        return {
            available: false,
            message: "Execution provider unavailable",
        };
    }
}

async function checkExecuteAvailability() {
    try {
        const response = await fetch(PISTON_EXECUTE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language: "javascript",
                version: "18.15.0",
                files: [{ name: "main.js", content: "console.log(1)" }],
                run_timeout: 3000,
                compile_timeout: 3000,
            }),
            signal: AbortSignal.timeout(10000),
        });
        const payload = await response.json().catch(() => ({}));
        if (payload.message && /whitelist|contact/i.test(payload.message)) {
            return { available: false, message: "Execution provider unavailable" };
        }
        return { available: response.ok || Boolean(payload.run), message: null };
    } catch {
        return { available: false, message: "Execution provider unavailable" };
    }
}

module.exports = {
    PROVIDER_ID: "piston",
    runTestCases,
    runSingleTest,
    executeOnPiston,
    checkRuntime,
    checkExecuteAvailability,
};
