const { buildHarness } = require("../services/executionProviders/harnessBuilder");
const { resolveProviderId, assertLanguageProvider } = require("../services/executionProviders/executionProviderFactory");

const cases = [
    {
        language: "javascript",
        functionName: "fizzBuzz",
        args: [5],
        userCode: "function fizzBuzz(n) { return [1,2,3]; }",
    },
    {
        language: "python",
        functionName: "fizzBuzz",
        args: [5],
        userCode: "def fizzBuzz(n):\n    return [1,2,3]",
    },
    {
        language: "java",
        functionName: "fizzBuzz",
        args: [5],
        userCode: "public static String[] fizzBuzz(int n) { return new String[] {\"1\"}; }",
    },
    {
        language: "cpp",
        functionName: "fizzBuzz",
        args: [5],
        userCode: "vector<string> fizzBuzz(int n) { return {\"1\"}; }",
    },
];

for (const testCase of cases) {
    const providerId = resolveProviderId(testCase.language);
    assertLanguageProvider(testCase.language, providerId);
    const harness = buildHarness(testCase.language, {
        userCode: testCase.userCode,
        functionName: testCase.functionName,
        args: testCase.args,
    });

    console.log(`\n=== ${testCase.language} (${providerId}) ===`);
    console.log("files:", harness.files.map((f) => f.name).join(", "));
    console.log("preview:", harness.files[0].content.slice(0, 120).replace(/\n/g, "\\n"));
}

console.log("\nHarness builder OK");
