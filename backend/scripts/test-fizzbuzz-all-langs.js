require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const CodingChallenge = require("../models/CodingChallenge");
const { runChallengeCode } = require("../services/testRunnerService");
const { resolveProviderId } = require("../services/executionProviders/executionProviderFactory");

const JAVASCRIPT_SOLUTION = `function fizzBuzz(n) {
  const result = [];
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) result.push("FizzBuzz");
    else if (i % 3 === 0) result.push("Fizz");
    else if (i % 5 === 0) result.push("Buzz");
    else result.push(String(i));
  }
  return result;
}`;

async function main() {
    await connectDB();
    const ch = await CodingChallenge.findOne({ slug: "fizzbuzz" });
    if (!ch) {
        throw new Error('Challenge "fizzbuzz" not found — run seedCodingChallenges.js first');
    }

    console.log("Provider routing:", resolveProviderId("javascript"));

    const result = await runChallengeCode({
        challengeId: ch._id,
        code: JAVASCRIPT_SOLUTION,
        language: "javascript",
        mode: "run",
    });

    const ok = result.passedCount === result.totalCount && result.totalCount > 0;
    console.log(
        "JAVASCRIPT",
        ok ? "PASS" : "FAIL",
        `${result.passedCount}/${result.totalCount}`,
        result.results[0]?.error || ""
    );

    await mongoose.connection.close();
    process.exit(ok ? 0 : 1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
