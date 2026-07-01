function buildCodingTestCasePrompt(challenge) {
    const examplesText = (challenge.examples || [])
        .map((ex, i) => `Example ${i + 1}: input=${ex.input}, output=${ex.output}`)
        .join("\n");

    const constraintsText = (challenge.constraints || []).map((c) => `- ${c}`).join("\n");

    const inputFormatHelp =
        challenge.expectedInputFormat === "spread"
            ? `Each test case "input" must be a JSON array of function arguments passed with spread syntax.
Example for twoSum(nums, target): input = [[2,7,11,15], 9]`
            : `Each test case "input" must be a JSON array representing the argument list for a single call.
Example for isValid(s): input = ["()"] means isValid("()").
Example for fizzBuzz(n): input = [15] means fizzBuzz(15).`;

    return `You are an expert coding-challenge test designer. Generate high-quality test cases that catch wrong, incomplete, and always-true/always-false solutions.

Problem title: ${challenge.title}
Function name: ${challenge.functionName}
Difficulty: ${challenge.difficulty}
Expected input format: ${challenge.expectedInputFormat}

Description:
${challenge.description}

Examples:
${examplesText || "(none)"}

Constraints:
${constraintsText || "(none)"}

${inputFormatHelp}

Return ONLY valid JSON with this exact shape (no markdown, no commentary):
{
  "visibleTestCases": [
    { "input": [], "expected": null, "label": "Example 1", "explanation": "why this case matters" }
  ],
  "hiddenTestCases": [
    { "input": [], "expected": null, "label": "Hidden 1", "explanation": "catches common bug" }
  ],
  "edgeCases": [
    { "input": [], "expected": null, "label": "Edge 1", "explanation": "minimum or boundary case" }
  ],
  "stressTests": [
    { "input": [], "expected": null, "label": "Stress 1", "explanation": "larger valid input within constraints" }
  ]
}

Quality rules:
- visibleTestCases: 2-4 basic examples similar to problem statement (not exhaustive edge cases).
- hiddenTestCases: 4-8 cases that catch wrong algorithms, unfinished logic, wrong ordering, always true/false answers.
- edgeCases: 4-8 minimum, single-element, unclosed, mismatched bracket, empty-adjacent, boundary cases valid under constraints.
- stressTests: 1-2 larger inputs still within stated constraints (keep arrays reasonably sized for execution).
- Every input MUST be a JSON array.
- Every expected MUST be JSON-compatible (boolean, number, string, array, object, null).
- Include cases that would pass weak tests but fail correct logic (e.g. stack not empty, partial checks, wrong mapping).
- Do NOT duplicate the same input+expected pair.
- Labels must be short and descriptive.`;
}

module.exports = {
    buildCodingTestCasePrompt,
};
