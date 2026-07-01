/**
 * Generic output comparison engine for coding challenge judges.
 * Language-agnostic: all runners should compare via compareOutputs().
 */

const isDev =
    (process.env.NODE_ENV || "development") !== "production" ||
    process.env.CODING_JUDGE_DEBUG === "true";

function looksLikeJsonString(value) {
    if (typeof value !== "string") return false;
    const trimmed = value.trim();
    if (!trimmed) return false;
    const first = trimmed[0];
    if (first === "[" || first === "{") return true;
    if (first === '"') return true;
    return trimmed === "true" || trimmed === "false" || trimmed === "null";
}

function normalizeOutput(value) {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    if (typeof value === "string") {
        if (looksLikeJsonString(value)) {
            try {
                return normalizeOutput(JSON.parse(value));
            } catch {
                return value;
            }
        }
        return value;
    }

    if (typeof value === "number") {
        if (Number.isNaN(value)) {
            return NaN;
        }
        return value;
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => normalizeOutput(item));
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (typeof value === "object") {
        const normalized = {};
        const keys = Object.keys(value).sort();
        for (const key of keys) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                normalized[key] = normalizeOutput(value[key]);
            }
        }
        return normalized;
    }

    return value;
}

function deepEqual(a, b) {
    if (Object.is(a, b)) {
        return true;
    }

    if (typeof a !== typeof b) {
        return false;
    }

    if (a === null || b === null) {
        return a === b;
    }

    if (Number.isNaN(a) && Number.isNaN(b)) {
        return true;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return false;
        }
        return a.every((item, index) => deepEqual(item, b[index]));
    }

    if (typeof a === "object" && typeof b === "object") {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) {
            return false;
        }
        return keysA.every((key) => deepEqual(a[key], b[key]));
    }

    return false;
}

function compareOutputs(actual, expected) {
    const normalizedActual = normalizeOutput(actual);
    const normalizedExpected = normalizeOutput(expected);
    const passed = deepEqual(normalizedActual, normalizedExpected);

    return {
        passed,
        normalizedActual,
        normalizedExpected,
    };
}

function safeStringify(value) {
    try {
        return JSON.stringify(value, (_key, val) => (val === undefined ? "__undefined__" : val));
    } catch {
        return String(value);
    }
}

function logComparison({ actual, expected, passed, normalizedActual, normalizedExpected, label }) {
    if (!isDev) {
        return;
    }

    const prefix = label ? `[judge:${label}]` : "[judge]";
    console.log(`${prefix} Actual:`, safeStringify(actual));
    console.log(`${prefix} Expected:`, safeStringify(expected));
    console.log(`${prefix} Normalized Actual:`, safeStringify(normalizedActual));
    console.log(`${prefix} Normalized Expected:`, safeStringify(normalizedExpected));
    console.log(`${prefix} Passed:`, passed);
}

function judgeOutputs(actual, expected, meta = {}) {
    const result = compareOutputs(actual, expected);
    logComparison({
        actual,
        expected,
        passed: result.passed,
        normalizedActual: result.normalizedActual,
        normalizedExpected: result.normalizedExpected,
        label: meta.label,
    });
    return result;
}

module.exports = {
    normalizeOutput,
    deepEqual,
    compareOutputs,
    judgeOutputs,
    logComparison,
};
