/**
 * Reusable factory for coding question dataset entries.
 * Add a new question by creating one object and exporting it from easy/medium/hard.js.
 */

function buildJsStarter(functionName, paramDoc = "", returnDoc = "any") {
    const paramsLine = paramDoc ? ` * ${paramDoc}\n` : "";
    return {
        javascript: `/**
${paramsLine} * @return {${returnDoc}}
 */
function ${functionName}() {
  // Write your code here
}`,
    };
}

function toVisibleTestCase(args, expected, label) {
    return {
        input: args,
        expected,
        label: label || "",
        type: "visible",
        isHidden: false,
    };
}

function toHiddenTestCase(args, expected, label) {
    return {
        input: args,
        expected,
        label: label || "",
        type: "hidden",
        isHidden: true,
    };
}

function mapTests(pairs, mapper) {
    return pairs.map((pair, index) => {
        const [args, expected, label] = pair;
        return mapper(args, expected, label || undefined, index);
    });
}

/**
 * @param {object} config
 * @returns {object} Normalized question for seeding
 */
function createQuestion({
    title,
    slug,
    description,
    difficulty,
    tags = [],
    examples = [],
    constraints = [],
    functionName,
    expectedInputFormat = "spread",
    testCases = [],
    hiddenTestCases = [],
    starterCode,
    order = 0,
    companies = [],
    hints = [],
    solution = "",
    timeComplexity = "",
    spaceComplexity = "",
    /** Shorthand: array of [args, expected, label?] */
    tests = [],
    hidden = [],
}) {
    if (!title || !slug || !functionName || !description || !difficulty) {
        throw new Error(`Invalid question definition: ${slug || title || "unknown"}`);
    }

    const visibleFromShorthand = mapTests(tests, (args, expected, label, i) =>
        toVisibleTestCase(args, expected, label || `Example ${i + 1}`)
    );
    const hiddenFromShorthand = mapTests(hidden, (args, expected, label, i) =>
        toHiddenTestCase(args, expected, label || `Hidden ${i + 1}`)
    );

    const normalizedVisible = [...testCases, ...visibleFromShorthand].map((tc, i) => ({
        ...toVisibleTestCase(tc.input, tc.expected, tc.label || `Example ${i + 1}`),
        ...(tc.explanation ? { explanation: tc.explanation } : {}),
    }));

    const normalizedHidden = [...hiddenTestCases, ...hiddenFromShorthand].map((tc, i) => ({
        ...toHiddenTestCase(tc.input, tc.expected, tc.label || `Hidden ${i + 1}`),
        ...(tc.explanation ? { explanation: tc.explanation } : {}),
    }));

    if (normalizedVisible.length === 0) {
        throw new Error(`Question "${slug}" must have at least one visible test case`);
    }

    return {
        title,
        slug,
        description: description.trim(),
        difficulty,
        tags,
        examples,
        constraints,
        functionName,
        expectedInputFormat,
        testCases: normalizedVisible,
        hiddenTestCases: normalizedHidden,
        starterCode: starterCode || buildJsStarter(functionName),
        supportedLanguages: ["javascript"],
        order,
        companies,
        hints,
        solution,
        timeComplexity,
        spaceComplexity,
        isActive: true,
    };
}

module.exports = {
    createQuestion,
    buildJsStarter,
    toVisibleTestCase,
    toHiddenTestCase,
};
