const vm = require("vm");
const { buildTestCaseResult } = require("./testCaseResult");

const MAX_CODE_LENGTH = 50000;
const BLOCKED_PATTERNS = [
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
];

function validateCode(code) {
    if (!code || typeof code !== "string") {
        throw new Error("Code is required");
    }
    if (code.length > MAX_CODE_LENGTH) {
        throw new Error("Code exceeds maximum allowed length");
    }

    if (
        /^\s*import\s+java\./m.test(code) ||
        /\bclass\s+Solution\b/.test(code) ||
        /\bpublic\s+(?:static\s+)?(?:int|void|boolean|String|List|double|float)\b/.test(code) ||
        /^\s*def\s+\w+\s*\(/m.test(code) ||
        /#include\s*</.test(code) ||
        /\bstd::\w+/.test(code)
    ) {
        throw new Error(
            "This code does not look like JavaScript. Select the correct language in the editor and try again."
        );
    }

    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(code)) {
            throw new Error("Code contains disallowed constructs");
        }
    }
}

function buildInvocationScript(userCode, functionName, input) {
    const args = Array.isArray(input) ? input : [input];
    const argsLiteral = JSON.stringify(args);
    return `
"use strict";
${userCode}
;(function() {
  if (typeof ${functionName} !== "function") {
    throw new Error("Function '${functionName}' is not defined");
  }
  const __args__ = ${argsLiteral};
  return ${functionName}(...__args__);
})();
`;
}

function createSandbox() {
    return {
        console: { log: () => {}, warn: () => {}, error: () => {} },
        Math,
        JSON,
        Array,
        Object,
        String,
        Number,
        Boolean,
        Date,
        Map,
        Set,
        RegExp,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        Infinity,
        NaN,
        undefined,
    };
}

function runSingleTestCase({ code, functionName, testCase, timeoutMs }) {
    const start = Date.now();
    const sandbox = createSandbox();

    try {
        const script = new vm.Script(
            buildInvocationScript(code, functionName, testCase.input),
            { filename: "user-code.js" }
        );
        const actual = script.runInNewContext(sandbox, {
            timeout: timeoutMs,
            displayErrors: true,
        });
        const runtimeMs = Date.now() - start;

        return buildTestCaseResult(testCase, { actual, runtimeMs });
    } catch (error) {
        return buildTestCaseResult(testCase, {
            actual: null,
            error: error.message || "Runtime error",
            runtimeMs: Date.now() - start,
        });
    }
}

function runTestCases({ code, functionName, testCases, timeoutMs }) {
    validateCode(code);
    return testCases.map((testCase) =>
        runSingleTestCase({ code, functionName, testCase, timeoutMs })
    );
}

module.exports = {
    validateCode,
    runTestCases,
};
