require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const CodingChallenge = require("../models/CodingChallenge");
const { runChallengeCode } = require("../services/testRunnerService");
const { resolveProviderId } = require("../services/executionProviders/executionProviderFactory");

const SOLUTIONS = {
    javascript: `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(String(i));
  }
  return result;
}`,
    python: `def fizzBuzz(n):
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result`,
    java: `import java.util.*;

class Solution {
    public List<String> fizzBuzz(int n) {
        List<String> result = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) result.add("FizzBuzz");
            else if (i % 3 == 0) result.add("Fizz");
            else if (i % 5 == 0) result.add("Buzz");
            else result.add(String.valueOf(i));
        }
        return result;
    }
}`,
    cpp: `vector<string> fizzBuzz(int n) {
    vector<string> result;
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) result.push_back("FizzBuzz");
        else if (i % 3 == 0) result.push_back("Fizz");
        else if (i % 5 == 0) result.push_back("Buzz");
        else result.push_back(to_string(i));
    }
    return result;
}`,
};

async function main() {
    await connectDB();
    const ch = await CodingChallenge.findOne({ slug: "fizzbuzz" });
    let failures = 0;

    console.log("Provider routing:");
    for (const lang of Object.keys(SOLUTIONS)) {
        console.log(`  ${lang}: ${resolveProviderId(lang)}`);
    }
    console.log("");

    for (const [lang, code] of Object.entries(SOLUTIONS)) {
        try {
            const result = await runChallengeCode({
                challengeId: ch._id,
                code,
                language: lang,
                mode: "run",
            });
            const ok = result.passedCount === result.totalCount && result.totalCount > 0;
            console.log(
                lang.toUpperCase(),
                ok ? "PASS" : "FAIL",
                `${result.passedCount}/${result.totalCount}`,
                result.results[0]?.error || ""
            );
            if (!ok) failures += 1;
        } catch (error) {
            console.log(lang.toUpperCase(), "ERROR", error.message);
            failures += 1;
        }
    }

    await mongoose.connection.close();
    process.exit(failures > 0 ? 1 : 0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
