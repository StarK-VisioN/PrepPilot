const { runTestCases } = require("../services/codeExecutionService");

async function main() {
    const js = `function fizzBuzz(n) {
  const a = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) a.push("FizzBuzz");
    else if (i % 3 === 0) a.push("Fizz");
    else if (i % 5 === 0) a.push("Buzz");
    else a.push(String(i));
  }
  return a;
}`;

    const jsResult = await runTestCases({
        language: "javascript",
        code: js,
        functionName: "fizzBuzz",
        testCases: [{ input: [3], expected: ["1", "2", "Fizz"], label: "t1" }],
    });
    console.log("JS:", jsResult.status, jsResult.language);

    const java = `import java.util.*;

class Solution {
    public List<String> fizzBuzz(int n) {
        List<String> a = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) a.add("FizzBuzz");
            else if (i % 3 == 0) a.add("Fizz");
            else if (i % 5 == 0) a.add("Buzz");
            else a.add(String.valueOf(i));
        }
        return a;
    }
}`;

    try {
        const javaResult = await runTestCases({
            language: "java",
            code: java,
            functionName: "fizzBuzz",
            testCases: [{ input: [3], expected: ["1", "2", "Fizz"], label: "t1" }],
        });
        console.log("Java:", javaResult.status, javaResult.language, javaResult.results[0].error || "ok");
    } catch (error) {
        console.log("Java setup error:", error.message);
    }

    try {
        await runTestCases({
            language: "javascript",
            code: java,
            functionName: "fizzBuzz",
            testCases: [{ input: [3], expected: ["1", "2", "Fizz"], label: "t1" }],
        });
        console.log("JS guard: FAILED - should have blocked Java code");
    } catch (error) {
        console.log("JS guard:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
