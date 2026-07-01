const { callAIWithRetry, cleanAndParseAIResponse } = require("./aiService");
const { buildCodingTestCasePrompt } = require("../utils/prompts/codingTestCases");
const {
    flattenGeneratedBundle,
    validateGeneratedBundle,
    mergeTestCases,
    normalizeTestCase,
    dedupeTestCases,
} = require("../utils/testCaseUtils");

const MAX_VISIBLE_FROM_AI = 4;
const MAX_HIDDEN_FROM_AI = 8;
const MAX_EDGE_FROM_AI = 8;
const MAX_STRESS_FROM_AI = 2;

function isAiGenerationEnabled() {
    return String(process.env.GENERATE_AI_TEST_CASES || "").toLowerCase() === "true";
}

function capGeneratedBundle(bundle) {
    return {
        visibleTestCases: (bundle.visibleTestCases || []).slice(0, MAX_VISIBLE_FROM_AI),
        hiddenTestCases: (bundle.hiddenTestCases || []).slice(0, MAX_HIDDEN_FROM_AI),
        edgeCases: (bundle.edgeCases || []).slice(0, MAX_EDGE_FROM_AI),
        stressTests: (bundle.stressTests || []).slice(0, MAX_STRESS_FROM_AI),
    };
}

async function generateTestCasesForChallenge(challenge) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not configured");
    }

    const prompt = buildCodingTestCasePrompt(challenge);
    const raw = await callAIWithRetry(prompt, 3, {
        temperature: 0.2,
        max_tokens: 4096,
    });

    const parsed = cleanAndParseAIResponse(raw);
    const capped = capGeneratedBundle(parsed);
    const errors = validateGeneratedBundle(capped);

    if (errors.length > 0) {
        throw new Error(`Invalid AI test cases: ${errors.join("; ")}`);
    }

    return flattenGeneratedBundle(capped);
}

function prepareManualTestCases(manualTestCases = []) {
    return manualTestCases.map((tc, index) =>
        normalizeTestCase(tc, {
            type: "visible",
            isHidden: false,
            label: tc.label || `Example ${index + 1}`,
        })
    );
}

async function enrichChallengeTestCases(challengeDef, manualEdgeCases = []) {
    const manualVisible = prepareManualTestCases(challengeDef.testCases || []);
    const manualHidden = (manualEdgeCases || []).map((tc, index) =>
        normalizeTestCase(tc, {
            label: tc.label || `Edge ${index + 1}`,
        })
    );

    let merged = mergeTestCases(manualVisible, manualHidden);

    if (!isAiGenerationEnabled()) {
        return merged;
    }

    try {
        const generated = await generateTestCasesForChallenge(challengeDef);
        merged = mergeTestCases(merged, generated);
        console.log(
            `[coding-tests] AI enriched "${challengeDef.slug}": ${merged.length} total cases`
        );
    } catch (error) {
        console.warn(
            `[coding-tests] AI generation skipped for "${challengeDef.slug}": ${error.message}`
        );
    }

    return dedupeTestCases(merged);
}

module.exports = {
    isAiGenerationEnabled,
    generateTestCasesForChallenge,
    enrichChallengeTestCases,
};
