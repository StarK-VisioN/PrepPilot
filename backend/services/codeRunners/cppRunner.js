const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { resolveTestArgs } = require("./shared/args");
const { validateCode } = require("./shared/security");
const { createSuccessResult, createErrorResult } = require("./shared/runContract");
const { detectCppCompiler, checkRuntime: checkLanguageRuntime } = require("./shared/runtimeAvailability");
const { COMPILE_TIMEOUT_MS } = require("./shared/constants");

const LANGUAGE = "cpp";

let cachedCompiler = null;

function valueToCppLiteral(value) {
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return `${value}`;
    if (typeof value === "string") {
        return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    if (Array.isArray(value)) {
        if (value.every((v) => typeof v === "number")) {
            return `{${value.join(", ")}}`;
        }
        if (value.every((v) => typeof v === "string")) {
            return `{${value.map((v) => valueToCppLiteral(v)).join(", ")}}`;
        }
    }
    throw new Error("Unsupported test case value for C++ runner");
}

function buildCppSource(userCode, functionName, args) {
    const argList = args.map((arg) => valueToCppLiteral(arg)).join(", ");

    return `#include <bits/stdc++.h>
using namespace std;

${userCode}

string jsonEscape(const string& s) {
    string out = "\\"";
    for (char c : s) {
        if (c == '\\\\' || c == '\\"') out += '\\\\';
        out += c;
    }
    out += "\\"";
    return out;
}

template<typename T>
string toJson(const T& value);

template<>
string toJson<bool>(const bool& value) {
    return value ? "true" : "false";
}

template<>
string toJson<int>(const int& value) {
    return to_string(value);
}

template<>
string toJson<string>(const string& value) {
    return jsonEscape(value);
}

template<>
string toJson<vector<int>>(const vector<int>& value) {
    string out = "[";
    for (size_t i = 0; i < value.size(); i++) {
        if (i > 0) out += ",";
        out += to_string(value[i]);
    }
    out += "]";
    return out;
}

template<>
string toJson<vector<string>>(const vector<string>& value) {
    string out = "[";
    for (size_t i = 0; i < value.size(); i++) {
        if (i > 0) out += ",";
        out += toJson(value[i]);
    }
    out += "]";
    return out;
}

int main() {
    auto result = ${functionName}(${argList});
    cout << toJson(result);
    return 0;
}
`;
}

function runCommand(command, args, options = {}) {
    const timeoutMs = options.timeout || COMPILE_TIMEOUT_MS;

    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            ...options,
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
                reject(new Error("C++ execution timed out"));
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

async function getCompiler() {
    if (cachedCompiler) {
        return cachedCompiler;
    }
    cachedCompiler = await detectCppCompiler();
    if (!cachedCompiler) {
        throw new Error("C++ compiler is not available in this environment.");
    }
    return cachedCompiler;
}

async function checkRuntime() {
    return checkLanguageRuntime(LANGUAGE);
}

async function run({ code, functionName, input, expectedInputFormat, timeoutMs }) {
    const start = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "coding-cpp-"));
    const sourcePath = path.join(tempDir, "main.cpp");
    const binaryPath = path.join(tempDir, process.platform === "win32" ? "main.exe" : "main");

    try {
        validateCode(code, LANGUAGE);
        const compiler = await getCompiler();
        const args = resolveTestArgs(input, expectedInputFormat);

        fs.writeFileSync(sourcePath, buildCppSource(code, functionName, args), "utf8");
        await runCommand(compiler, ["-O2", "-std=c++17", sourcePath, "-o", binaryPath], {
            cwd: tempDir,
            timeout: timeoutMs,
        });
        const { stdout, stderr } = await runCommand(binaryPath, [], {
            cwd: tempDir,
            timeout: timeoutMs,
        });

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
