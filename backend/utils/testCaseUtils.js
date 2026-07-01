const TEST_CASE_TYPES = ["visible", "hidden", "edge", "stress"];

function isJsonCompatible(value) {
    if (value === undefined) return false;
    try {
        JSON.stringify(value);
        return true;
    } catch {
        return false;
    }
}

function normalizeTestCase(raw, defaults = {}) {
    const type = TEST_CASE_TYPES.includes(raw.type) ? raw.type : defaults.type || "visible";
    const isHidden =
        raw.isHidden === true || type === "hidden" || type === "edge" || type === "stress";

    return {
        input: raw.input,
        expected: raw.expected,
        label: raw.label || defaults.label || "",
        isHidden,
        type,
        explanation: typeof raw.explanation === "string" ? raw.explanation : "",
    };
}

function testCaseKey(testCase) {
    return JSON.stringify({ input: testCase.input, expected: testCase.expected });
}

function dedupeTestCases(testCases) {
    const seen = new Set();
    const result = [];

    for (const tc of testCases) {
        const key = testCaseKey(tc);
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(tc);
    }

    return result;
}

function validateTestCase(testCase, index = 0) {
    const errors = [];
    const prefix = `testCases[${index}]`;

    if (!Array.isArray(testCase.input)) {
        errors.push(`${prefix}.input must be an array`);
    }

    if (!isJsonCompatible(testCase.expected)) {
        errors.push(`${prefix}.expected must be JSON-compatible`);
    }

    if (!TEST_CASE_TYPES.includes(testCase.type)) {
        errors.push(`${prefix}.type must be one of: ${TEST_CASE_TYPES.join(", ")}`);
    }

    if (["hidden", "edge", "stress"].includes(testCase.type) && testCase.isHidden !== true) {
        errors.push(`${prefix} with type ${testCase.type} must have isHidden=true`);
    }

    if (testCase.type === "visible" && testCase.isHidden === true) {
        errors.push(`${prefix} visible tests should not be hidden`);
    }

    return errors;
}

function validateGeneratedBundle(bundle) {
    const errors = [];
    if (!bundle || typeof bundle !== "object") {
        return ["Generated bundle must be an object"];
    }

    const groups = ["visibleTestCases", "hiddenTestCases", "edgeCases", "stressTests"];
    for (const group of groups) {
        if (!Array.isArray(bundle[group])) {
            errors.push(`${group} must be an array`);
        }
    }

    if (errors.length) return errors;

    const normalized = flattenGeneratedBundle(bundle);
    if (normalized.length === 0) {
        errors.push("At least one test case is required");
    }

    normalized.forEach((tc, i) => {
        errors.push(...validateTestCase(tc, i));
    });

    return errors;
}

function flattenGeneratedBundle(bundle) {
    const mapping = [
        ["visibleTestCases", { type: "visible", isHidden: false }],
        ["hiddenTestCases", { type: "hidden", isHidden: true }],
        ["edgeCases", { type: "edge", isHidden: true }],
        ["stressTests", { type: "stress", isHidden: true }],
    ];

    const result = [];

    for (const [key, defaults] of mapping) {
        for (const raw of bundle[key] || []) {
            result.push(
                normalizeTestCase(raw, {
                    ...defaults,
                    label: raw.label || defaults.label || "",
                })
            );
        }
    }

    return result;
}

function mergeTestCases(baseCases, extraCases) {
    return dedupeTestCases([
        ...baseCases.map((tc) => normalizeTestCase(tc)),
        ...extraCases.map((tc) => normalizeTestCase(tc)),
    ]);
}

function getTestCasesForMode(testCases, mode = "run") {
    const normalized = (testCases || []).map((tc) => normalizeTestCase(tc));

    if (mode === "submit") {
        return normalized;
    }

    return normalized.filter((tc) => tc.type === "visible" && !tc.isHidden);
}

function getVisibleTestCasesForClient(testCases) {
    return getTestCasesForMode(testCases, "run").map((tc) => ({
        label: tc.label,
        input: tc.input,
        expected: tc.expected,
        type: tc.type,
    }));
}

function sanitizeResultForClient(result) {
    const sanitized = {
        label: result.label,
        passed: result.passed,
        input: result.input,
        actual: result.actual,
        error: result.error,
        runtimeMs: result.runtimeMs,
        isHidden: result.isHidden || false,
        type: result.type || "visible",
    };

    if (sanitized.isHidden) {
        sanitized.expected = undefined;
        if (!sanitized.label) {
            sanitized.label = "Hidden test";
        }
    } else {
        sanitized.expected = result.expected;
    }

    return sanitized;
}

function sanitizeExecutionPayload(payload) {
    if (!payload?.results) return payload;

    return {
        ...payload,
        results: payload.results.map(sanitizeResultForClient),
    };
}

module.exports = {
    TEST_CASE_TYPES,
    normalizeTestCase,
    dedupeTestCases,
    validateTestCase,
    validateGeneratedBundle,
    flattenGeneratedBundle,
    mergeTestCases,
    getTestCasesForMode,
    getVisibleTestCasesForClient,
    sanitizeResultForClient,
    sanitizeExecutionPayload,
};
