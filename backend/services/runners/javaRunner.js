const { spawn, execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildTestCaseResult } = require("./testCaseResult");

const MAX_CODE_LENGTH = 50000;
const BLOCKED_PATTERNS = [
    /\bProcessBuilder\b/,
    /\bRuntime\.getRuntime\b/,
    /\bSystem\.exit\b/,
    /\bClass\.forName\b/,
    /\bjava\.io\.File\b/,
    /\bjava\.nio\b/,
    /\bjava\.net\b/,
    /\bUnsafe\b/,
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

function valueToJavaLiteral(value) {
    if (value === null) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return Number.isInteger(value) ? `${value}` : `${value}`;
    if (typeof value === "string") return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    if (Array.isArray(value)) {
        if (value.length === 0) return "new int[]{}";
        const allNumbers = value.every((v) => typeof v === "number");
        const allStrings = value.every((v) => typeof v === "string");
        if (allNumbers) {
            return `new int[]{${value.join(", ")}}`;
        }
        if (allStrings) {
            return `new String[]{${value.map((v) => valueToJavaLiteral(v)).join(", ")}}`;
        }
        return `new Object[]{${value.map((v) => valueToJavaLiteral(v)).join(", ")}}`;
    }
    throw new Error("Unsupported test case value for Java runner");
}

function wrapSolutionCode(userCode) {
    const trimmed = userCode.trim();
    if (/class\s+Solution\b/.test(trimmed)) {
        return trimmed;
    }
    return `class Solution {\n${trimmed}\n}`;
}

function buildRunnerMain(functionName, args) {
    const argList = args.map((arg) => valueToJavaLiteral(arg)).join(", ");
    return `
class RunMain {
    public static void main(String[] args) throws Exception {
        Solution solution = new Solution();
        Object result = solution.${functionName}(${argList});
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

function commandExists(command) {
    try {
        if (process.platform === "win32") {
            execSync(`where ${command}`, { stdio: "ignore", windowsHide: true });
        } else {
            execSync(`command -v ${command}`, { stdio: "ignore" });
        }
        return true;
    } catch {
        return false;
    }
}

async function detectJavaCommands() {
    if (commandExists("javac") && commandExists("java")) {
        return { javac: "javac", java: "java" };
    }

    const javaHome = process.env.JAVA_HOME;
    if (javaHome) {
        const bin = path.join(javaHome, "bin");
        const javac = path.join(bin, process.platform === "win32" ? "javac.exe" : "javac");
        const java = path.join(bin, process.platform === "win32" ? "java.exe" : "java");
        if (fs.existsSync(javac) && fs.existsSync(java)) {
            return { javac, java };
        }
    }

    throw new Error(
        "Java execution requires JDK (javac/java) on the server. Install JDK or use JavaScript for now."
    );
}

async function runSingleTestCase({
    code,
    functionName,
    testCase,
    timeoutMs,
    javaCommands,
}) {
    const start = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "coding-java-"));

    try {
        const args = Array.isArray(testCase.input) ? testCase.input : [testCase.input];
        fs.writeFileSync(path.join(tempDir, "Solution.java"), wrapSolutionCode(code), "utf8");
        fs.writeFileSync(
            path.join(tempDir, "RunMain.java"),
            buildRunnerMain(functionName, args),
            "utf8"
        );

        await runCommand(javaCommands.javac, ["Solution.java", "RunMain.java"], {
            cwd: tempDir,
            timeout: timeoutMs,
        });
        const { stdout } = await runCommand(
            javaCommands.java,
            ["-cp", tempDir, "RunMain"],
            { cwd: tempDir, timeout: timeoutMs }
        );

        const actual = JSON.parse(stdout.trim());
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
    const javaCommands = await detectJavaCommands();
    const results = [];

    for (const testCase of testCases) {
        results.push(
            await runSingleTestCase({
                code,
                functionName,
                testCase,
                timeoutMs,
                javaCommands,
            })
        );
    }

    return results;
}

module.exports = {
    validateCode,
    runTestCases,
};
