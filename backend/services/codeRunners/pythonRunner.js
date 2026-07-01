const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { resolveTestArgs } = require("./shared/args");
const { validateCode } = require("./shared/security");
const { createSuccessResult, createErrorResult } = require("./shared/runContract");
const { detectPythonCommand, checkRuntime: checkLanguageRuntime } = require("./shared/runtimeAvailability");

const LANGUAGE = "python";

let cachedPythonCommand = null;

function buildHarness(userCode, functionName) {
    return `import json
import sys

${userCode}

if __name__ == "__main__":
    payload = json.load(sys.stdin)
    fn = globals().get(payload["functionName"])
    if fn is None or not callable(fn):
        raise Exception("Function '" + payload["functionName"] + "' is not defined")
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
                resolve({ output: JSON.parse(stdout.trim() || "null"), stdout, stderr });
            } catch {
                reject(new Error(stderr.trim() || "Invalid JSON output from Python runner"));
            }
        });

        child.stdin.write(JSON.stringify(payload));
        child.stdin.end();
    });
}

async function getPythonCommand() {
    if (cachedPythonCommand) {
        return cachedPythonCommand;
    }
    cachedPythonCommand = await detectPythonCommand();
    if (!cachedPythonCommand) {
        throw new Error("Python runtime is not available in this environment.");
    }
    return cachedPythonCommand;
}

async function checkRuntime() {
    return checkLanguageRuntime(LANGUAGE);
}

async function run({ code, functionName, input, expectedInputFormat, timeoutMs }) {
    const start = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "coding-py-"));
    const scriptPath = path.join(tempDir, "solution.py");

    try {
        validateCode(code, LANGUAGE);
        const pythonCommand = await getPythonCommand();
        const args = resolveTestArgs(input, expectedInputFormat);

        fs.writeFileSync(scriptPath, buildHarness(code, functionName), "utf8");

        const { output, stdout, stderr } = await runPythonProcess(
            pythonCommand,
            scriptPath,
            { functionName, args },
            timeoutMs
        );

        return createSuccessResult({
            output,
            runtimeMs: Date.now() - start,
            stdout,
            stderr,
        });
    } catch (error) {
        return createErrorResult({
            error: error.message || "Runtime error",
            runtimeMs: Date.now() - start,
        });
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

module.exports = {
    LANGUAGE,
    checkRuntime,
    run,
};
