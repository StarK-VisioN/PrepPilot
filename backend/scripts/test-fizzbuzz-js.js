require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const CodingChallenge = require("../models/CodingChallenge");
const { runChallengeCode, submitChallengeCode } = require("../services/testRunnerService");

const FIZZBUZZ = `function fizzBuzz(n) {
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
        console.error("FizzBuzz challenge not found. Run seed script first.");
        process.exit(1);
    }

    const runResult = await runChallengeCode({
        challengeId: ch._id,
        code: FIZZBUZZ,
        language: "javascript",
        mode: "run",
    });
    console.log(
        "RUN:",
        runResult.passedCount === runResult.totalCount ? "PASS" : "FAIL",
        `${runResult.passedCount}/${runResult.totalCount}`
    );

    const submitResult = await submitChallengeCode({
        challengeId: ch._id,
        code: FIZZBUZZ,
        language: "javascript",
    });
    console.log(
        "SUBMIT:",
        submitResult.status,
        `${submitResult.passedCount}/${submitResult.totalCount}`
    );

    const badLang = await runChallengeCode({
        challengeId: ch._id,
        code: FIZZBUZZ,
        language: "python",
        mode: "run",
    }).catch((e) => e.message);
    console.log("PYTHON rejected:", badLang);

    await mongoose.connection.close();
    process.exit(runResult.passedCount === runResult.totalCount ? 0 : 1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
