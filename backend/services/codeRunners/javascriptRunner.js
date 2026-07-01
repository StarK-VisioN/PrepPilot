const vm = require("vm");
const { resolveTestArgs } = require("./shared/args");
const { validateCode } = require("./shared/security");
const { createSuccessResult, createErrorResult } = require("./shared/runContract");

const LANGUAGE = "javascript";

function buildInvocationScript(userCode, functionName, args) {
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

async function checkRuntime() {
    return { available: true, message: null };
}

async function run({ code, functionName, input, expectedInputFormat, timeoutMs }) {
    const start = Date.now();

    try {
        validateCode(code, LANGUAGE);
        const args = resolveTestArgs(input, expectedInputFormat);
        const script = new vm.Script(buildInvocationScript(code, functionName, args), {
            filename: "user-code.js",
        });
        const output = script.runInNewContext(createSandbox(), {
            timeout: timeoutMs,
            displayErrors: true,
        });

        return createSuccessResult({
            output,
            runtimeMs: Date.now() - start,
        });
    } catch (error) {
        return createErrorResult({
            error: error.message || "Runtime error",
            runtimeMs: Date.now() - start,
        });
    }
}

module.exports = {
    LANGUAGE,
    checkRuntime,
    run,
};
