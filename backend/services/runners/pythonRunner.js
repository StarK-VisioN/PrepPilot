const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildTestCaseResult } = require("./testCaseResult");

const MAX_CODE_LENGTH = 50000;
const BLOCKED_PATTERNS = [
    /\bimport\s+os\b/,
    /\bimport\s+subprocess\b/,
    /\bimport\s+socket\b/,
    /\bimport\s+shutil\b/,
    /\bimport\s+sys\b/,
    /\bfrom\s+os\b/,
    /\bfrom\s+subprocess\b/,
    /\bfrom\s+socket\b/,
    /\b__import__\s*\(/,
    /\bopen\s*\(/,
    /\beval\s*\(/,
    /\bexec\s*\(/,
    /\bcompile\s*\(/,
    /\bgetattr\s*\(/,
    /\bglobals\s*\(/,
    /\blocals\s*\(/,
];

function validateCode(code) {
    if (!code || typeof code !== "string") {
        throw new Error("Code is required");
    }
    if (code.length > MAX_CODE_LENGTH) {
        throw new Error("Code exceeds maximum allowed length");
    }
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(code)) {
            throw new Error("Code contains disallowed constructs");
        }
    }
}

function buildHarness(userCode, functionName, args) {
    return `
import json
import sys

${userCode}

if __name__ == "__main__":
    payload = json.load(sys.stdin)
    fn = globals().get(payload["functionName"])
    if fn is None or not callable(fn):
        raise Exception(f"Function '{payload["functionName"]}' is not defined")
    args = payload["args"]
    if not isinstance(args, list):
        args = [args]
    result = fn(*args)
    json.dump(result, sys.stdout)
`;
}

function runPythonProcess(pythonCommand, scriptPath, payload, timeoutMs) {
    const args = [...(pythonCommand.prefixArgs || []), scriptPath];
    return new Promise((resolve, reject) => {
        const child = spawn(pythonCommand.command, args, {
            stdio: ["pipe", "pipe", "pipe"],
            windowsHide: true,
        });

        let stdout = "";
        let stderr = "";
        let timedOut = false;

        const timer = setTimeout(() => {
            timedOut = true;
            child.kill("SIGKILL");
        }, timeoutMs);

        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        child.on("error", (error) => {
            clearTimeout(timer);
            reject(error);
        });

        child.on("close", (code) => {
            clearTimeout(timer);
            if (timedOut) {
                reject(new Error("Execution timed out"));
                return;
            }
            if (code !== 0) {
                reject(new Error(stderr.trim() || `Python exited with code ${code}`));
                return;
            }
            try {
                resolve(JSON.parse(stdout.trim() || "null"));
            } catch {
                reject(new Error(stderr.trim() || "Invalid output from Python runner"));
            }
        });

        child.stdin.write(JSON.stringify(payload));
        child.stdin.end();
    });
}

async function detectPythonCommand() {
    if (process.platform === "win32") {
        try {
            await new Promise((resolve, reject) => {
                const child = spawn("py", ["-3", "--version"], { windowsHide: true });
                child.on("error", reject);
                child.on("close", (code) => (code === 0 ? resolve() : reject()));
            });
            return { command: "py", prefixArgs: ["-3"] };
        } catch {
            // fall through
        }
    }

    for (const command of ["python3", "python"]) {
        try {
            await new Promise((resolve, reject) => {
                const child = spawn(command, ["--version"], { windowsHide: true });
                child.on("error", reject);
                child.on("close", (code) => (code === 0 ? resolve() : reject()));
            });
            return { command, prefixArgs: [] };
        } catch {
            // try next
        }
    }
    throw new Error("Python 3 is not installed on the server. Use JavaScript or try again later.");
}

async function runSingleTestCase({ code, functionName, testCase, timeoutMs, pythonCommand }) {
    const start = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "coding-py-"));
    const scriptPath = path.join(tempDir, "solution.py");

    try {
        const args = Array.isArray(testCase.input) ? testCase.input : [testCase.input];
        fs.writeFileSync(
            scriptPath,
            buildHarness(code, functionName, args),
            "utf8"
        );

        const actual = await runPythonProcess(
            pythonCommand,
            scriptPath,
            { functionName, args },
            timeoutMs
        );
        const runtimeMs = Date.now() - start;

        return buildTestCaseResult(testCase, { actual, runtimeMs });
    } catch (error) {
        return buildTestCaseResult(testCase, {
            actual: null,
            error: error.message || "Runtime error",
            runtimeMs: Date.now() - start,
        });
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

async function runTestCases({ code, functionName, testCases, timeoutMs }) {
    validateCode(code);
    const pythonCommand = await detectPythonCommand();
    const results = [];

    for (const testCase of testCases) {
        results.push(
            await runSingleTestCase({
                code,
                functionName,
                testCase,
                timeoutMs,
                pythonCommand,
            })
        );
    }

    return results;
}

module.exports = {
    validateCode,
    runTestCases,
};
