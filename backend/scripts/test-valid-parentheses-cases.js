require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const CodingChallenge = require("../models/CodingChallenge");
const { runChallengeCode, submitChallengeCode } = require("../services/testRunnerService");

const CORRECT = `function isValid(s) {
  const stack = [];
  const map = { ")": "(", "}": "{", "]": "[" };
  for (const ch of s) {
    if (ch === "(" || ch === "{" || ch === "[") {
      stack.push(ch);
    } else {
      if (stack.length === 0 || stack.pop() !== map[ch]) return false;
    }
  }
  return stack.length === 0;
}`;

const ALWAYS_TRUE = `function isValid(s) { return true; }`;
const ALWAYS_FALSE = `function isValid(s) { return false; }`;
const STACK_LENGTH_BUG = `function isValid(s) {
  const stack = [];
  for (const ch of s) {
    if (ch === "(" || ch === "{" || ch === "[") stack.push(ch);
    else if (stack.length) stack.pop();
  }
  return stack.length >= 0;
}`;

async function assertSubmit(challengeId, label, code, expectAccepted) {
    const result = await submitChallengeCode({
        challengeId,
        code,
        language: "javascript",
    });

    const ok = expectAccepted ? result.status === "Accepted" : result.status === "Failed";

    console.log(
        `${ok ? "PASS" : "FAIL"} submit ${label}: ${result.status} (${result.passedCount}/${result.totalCount})`
    );

    if (!ok) {
        const failed = (result.results || []).filter((r) => !r.passed);
        failed.slice(0, 3).forEach((r) => {
            console.log(`  failed: ${r.label || "case"} hidden=${r.isHidden}`);
        });
    }

    return ok;
}

async function assertRunVisibleOnly(challengeId, code) {
    const run = await runChallengeCode({
        challengeId,
        code,
        language: "javascript",
        mode: "run",
    });
    const submit = await submitChallengeCode({
        challengeId,
        code,
        language: "javascript",
    });

    const runOnlyVisible = run.totalCount < submit.totalCount;
    console.log(
        `${runOnlyVisible ? "PASS" : "FAIL"} run uses fewer tests: run=${run.totalCount}, submit=${submit.totalCount}`
    );
    return runOnlyVisible;
}

async function main() {
    await connectDB();
    const ch = await CodingChallenge.findOne({ slug: "valid-parentheses" });
    if (!ch) {
        console.error("Valid Parentheses not found. Run: node scripts/seedCodingChallenges.js");
        process.exit(1);
    }

    console.log(`Challenge has ${ch.testCases.length} test cases`);
    const hiddenCount = ch.testCases.filter((tc) => tc.isHidden).length;
    console.log(`Hidden/edge/stress cases: ${hiddenCount}`);

    const checks = [
        await assertSubmit(ch._id, "correct solution", CORRECT, true),
        await assertSubmit(ch._id, "always true", ALWAYS_TRUE, false),
        await assertSubmit(ch._id, "always false", ALWAYS_FALSE, false),
        await assertSubmit(ch._id, "stack.length >= 0 bug", STACK_LENGTH_BUG, false),
        await assertRunVisibleOnly(ch._id, CORRECT),
    ];

    await mongoose.connection.close();
    process.exit(checks.every(Boolean) ? 0 : 1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
