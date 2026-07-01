const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildTestCaseResult } = require("./testCaseResult");

const MAX_CODE_LENGTH = 50000;
const BLOCKED_PATTERNS = [
    /\b#include\s*<thread>/,
    /\b#include\s*<filesystem>/,
    /\b#include\s*<fstream>/,
    /\b#include\s*<cstdlib>/,
    /\bsystem\s*\(/,
    /\bexec\s*\(/,
    /\bfork\s*\(/,
    /\bpopen\s*\(/,
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

function valueToCppLiteral(value) {
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return `${value}`;
    if (typeof value === "string") return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
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
    return `
#include <bits/stdc++.h>
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
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            ...options,
            windowsHide: true,
        });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (chunk) => {
            stdout += chunk.toString();
        });
        child.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });
        child.on("error", reject);
        child.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
                return;
            }
            resolve({ stdout, stderr });
        });
    });
}

async function detectCppCompiler() {
    const compilers = ["g++", "clang++"];
    for (const compiler of compilers) {
        try {
            await runCommand(compiler, ["--version"]);
            return compiler;
        } catch {
            // continue
        }
    }
    throw new Error(
        "C++ compiler (g++) is not installed on the server. Use JavaScript or Python, or install MinGW/g++ for C++ support."
    );
}

async function runSingleTestCase({ code, functionName, testCase, timeoutMs, compiler }) {
    const start = Date.now();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "coding-cpp-"));
    const sourcePath = path.join(tempDir, "main.cpp");
    const binaryPath = path.join(tempDir, process.platform === "win32" ? "main.exe" : "main");

    try {
        const args = Array.isArray(testCase.input) ? testCase.input : [testCase.input];
        fs.writeFileSync(sourcePath, buildCppSource(code, functionName, args), "utf8");
        await runCommand(compiler, ["-O2", "-std=c++17", sourcePath, "-o", binaryPath], {
            cwd: tempDir,
            timeout: timeoutMs,
        });
        const { stdout } = await runCommand(binaryPath, [], {
            cwd: tempDir,
            timeout: timeoutMs,
        });

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
    const compiler = await detectCppCompiler();
    const results = [];

    for (const testCase of testCases) {
        results.push(
            await runSingleTestCase({
                code,
                functionName,
                testCase,
                timeoutMs,
                compiler,
            })
        );
    }

    return results;
}

module.exports = {
    validateCode,
    runTestCases,
};
