const { MAX_CODE_LENGTH } = require("./constants");

const BLOCKED_BY_LANGUAGE = {
    javascript: [
        /\brequire\s*\(/,
        /\bimport\s*\(/,
        /\bprocess\b/,
        /\bglobal\b/,
        /\bglobalThis\b/,
        /\bchild_process\b/,
        /\bfs\b/,
        /\b__dirname\b/,
        /\b__filename\b/,
        /\bmodule\b/,
        /\bexports\b/,
        /\beval\s*\(/,
        /\bFunction\s*\(/,
        /\bsetTimeout\s*\(/,
        /\bsetInterval\s*\(/,
        /\bsetImmediate\s*\(/,
        /\bProxy\b/,
        /\bReflect\b/,
        /\bWebAssembly\b/,
    ],
    python: [
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
    ],
    java: [
        /\bProcessBuilder\b/,
        /\bRuntime\.getRuntime\b/,
        /\bSystem\.exit\b/,
        /\bClass\.forName\b/,
        /\bjava\.io\.File\b/,
        /\bjava\.nio\b/,
        /\bjava\.net\b/,
    ],
    cpp: [
        /\b#include\s*<thread>/,
        /\b#include\s*<filesystem>/,
        /\b#include\s*<fstream>/,
        /\b#include\s*<cstdlib>/,
        /\bsystem\s*\(/,
        /\bexec\s*\(/,
        /\bfork\s*\(/,
        /\bpopen\s*\(/,
    ],
};

function validateCode(code, language) {
    if (!code || typeof code !== "string") {
        throw new Error("Code is required");
    }
    if (code.length > MAX_CODE_LENGTH) {
        throw new Error("Code exceeds maximum allowed length");
    }

    const patterns = BLOCKED_BY_LANGUAGE[language] || [];
    for (const pattern of patterns) {
        if (pattern.test(code)) {
            throw new Error("Code contains disallowed constructs");
        }
    }
}

module.exports = {
    validateCode,
};
