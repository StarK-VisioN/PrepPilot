const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { resolveTestArgs } = require("./shared/args");
const { validateCode } = require("./shared/security");
const { createSuccessResult, createErrorResult } = require("./shared/runContract");
const { detectJavaCommands, checkRuntime: checkLanguageRuntime } = require("./shared/runtimeAvailability");

const LANGUAGE = "java";

let cachedJavaCommands = null;

function valueToJavaLiteral(value) {
    if (value === null) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return Number.isInteger(value) ? `${value}` : `${value}`;
    if (typeof value === "string") {
        return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return "new int[]{}";
        const allNumbers = value.every((v) => typeof v === "number");
        const allStrings = value.every((v) => typeof v === "string");
        if (allNumbers) return `new int[]{${value.join(", ")}}`;
        if (allStrings) {
            return `new String[]{${value.map((v) => valueToJavaLiteral(v)).join(", ")}}`;
        }
        return `new Object[]{${value.map((v) => valueToJavaLiteral(v)).join(", ")}}`;
    }
    throw new Error("Unsupported test case value for Java runner");
}

function detectJavaEntryClass(userCode) {
    if (/class\s+Main\b/.test(userCode)) return "Main";
    if (/class\s+Solution\b/.test(userCode)) return "Solution";
    return "Solution";
}

function wrapSolutionCode(userCode) {
    const trimmed = userCode.trim();
    if (/class\s+(Main|Solution)\b/.test(trimmed)) {
        return trimmed;
    }
    return `class Solution {\n${trimmed}\n}`;
}

function buildRunnerMain(userCode, functionName, args) {
    const argList = args.map((arg) => valueToJavaLiteral(arg)).join(", ");
    const entryClass = detectJavaEntryClass(userCode);
    const invocation =
        entryClass === "Main"
            ? `Main.${functionName}(${argList})`
            : `new Solution().${functionName}(${argList})`;

    return `
class RunMain {
    public static void main(String[] args) throws Exception {
        Object result = ${invocation};
        System.out.print(toJson(result));
    }

    static String toJson(Object value) {
        if (value == null) return "null";
        if (value instanceof Boolean) return ((Boolean) value) ? "true" : "false";
        if (value instanceof Integer || value instanceof Long || value instanceof Double || value instanceof Float) {
            return String.valueOf(value);
        }
        if (value instanceof String) {
            return "\\"" + ((String) value).replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"") + "\\"";
        }
        if (value instanceof int[]) {
            int[] arr = (int[]) value;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(arr[i]);
            }
            sb.append("]");
            return sb.toString();
        }
        if (value instanceof String[]) {
            String[] arr = (String[]) value;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(toJson(arr[i]));
            }
            sb.append("]");
            return sb.toString();
        }
        if (value instanceof java.util.List) {
            java.util.List<?> list = (java.util.List<?>) value;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(toJson(list.get(i)));
            }
            sb.append("]");
            return sb.toString();
        }
        return String.valueOf(value);
    }
}
`;
}

function runCommand(command, args, options = {}) {
    const timeoutMs = options.timeout || 10000;

    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: options.cwd,
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
                reject(new Error("Java execution timed out"));
                return;
            }
            if (code !== 0) {
                reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
                return;
            }
            resolve({ stdout, stderr });
        });
    });
}

async function getJavaCommands() {
    if (cachedJavaCommands) {
        return cachedJavaCommands;
    }
    cachedJavaCommands = await detectJavaCommands();
    if (!cachedJavaCommands) {
        throw new Error("Java runtime is not available in this environment.");
    }
    return cachedJavaCommands;
}

async function checkRuntime() {
    return checkLanguageRuntime(LANGUAGE);
}

async function run({ code, functionName, input, expectedInputFormat, timeoutMs }) {
    const start = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "coding-java-"));

    try {
        validateCode(code, LANGUAGE);
        const javaCommands = await getJavaCommands();
        const args = resolveTestArgs(input, expectedInputFormat);
        const wrappedCode = wrapSolutionCode(code);
        const entryClass = detectJavaEntryClass(wrappedCode);
        const sourceFile = entryClass === "Main" ? "Main.java" : "Solution.java";

        fs.writeFileSync(path.join(tempDir, sourceFile), wrappedCode, "utf8");
        fs.writeFileSync(
            path.join(tempDir, "RunMain.java"),
            buildRunnerMain(wrappedCode, functionName, args),
            "utf8"
        );

        await runCommand(javaCommands.javac, [sourceFile, "RunMain.java"], {
            cwd: tempDir,
            timeout: timeoutMs,
        });
        const { stdout, stderr } = await runCommand(
            javaCommands.java,
            ["-cp", tempDir, "RunMain"],
            { cwd: tempDir, timeout: timeoutMs }
        );

        return createSuccessResult({
            output: JSON.parse(stdout.trim()),
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
