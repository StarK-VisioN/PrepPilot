require("dotenv").config();
const { resolveExecutionLanguage } = require("../utils/codingLanguages");
const { runTestCases } = require("../services/codeExecutionService");

const CPP_CODE = `#include <vector>
#include <string>
using namespace std;
vector<string> fizzBuzz(int n) {
    vector<string> answer;
    for (int i = 1; i <= n; i++) {
        if (i % 3 == 0 && i % 5 == 0) answer.push_back("FizzBuzz");
        else if (i % 3 == 0) answer.push_back("Fizz");
        else if (i % 5 == 0) answer.push_back("Buzz");
        else answer.push_back(to_string(i));
    }
    return answer;
}`;

async function main() {
    const resolved = resolveExecutionLanguage(CPP_CODE, "javascript");
    console.log("Wrong request language=javascript, inferred:", resolved);

    const result = await runTestCases({
        language: resolved.language,
        code: CPP_CODE,
        functionName: "fizzBuzz",
        testCases: [{ label: "t1", input: [3], expected: ["1", "2", "Fizz"] }],
        expectedInputFormat: "single",
    });

    console.log("Status:", result.status);
    console.log("Error:", result.results[0]?.error || "(none)");
    const ok =
        !/Private field|Unexpected identifier|strict mode reserved/i.test(
            result.results[0]?.error || ""
        );
    console.log(ok ? "PASS: no JS VM parser errors" : "FAIL: still JS VM errors");
    process.exit(ok ? 0 : 1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
