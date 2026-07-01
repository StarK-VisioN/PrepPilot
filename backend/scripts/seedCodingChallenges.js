require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");

const CodingChallenge = require("../models/CodingChallenge");

const easyQuestions = require("../data/codingQuestions/easy");
const mediumQuestions = require("../data/codingQuestions/medium");
const hardQuestions = require("../data/codingQuestions/hard");

const { enrichChallengeTestCases } = require("../services/codingTestCaseGeneratorService");

const { MANUAL_EDGE_CASES_BY_SLUG } = require("./codingChallengeTestCases");

const ALL_QUESTIONS = [...easyQuestions, ...mediumQuestions, ...hardQuestions];

function toDbPayload(question) {
    const {
        hiddenTestCases,
        order,
        companies,
        hints,
        solution,
        timeComplexity,
        spaceComplexity,
        ...dbFields
    } = question;

    return {
        dbFields,
        hiddenTestCases: hiddenTestCases || [],
    };
}

async function seed() {
    await connectDB();

    const aiEnabled = String(process.env.GENERATE_AI_TEST_CASES || "").toLowerCase() === "true";
    console.log(`GENERATE_AI_TEST_CASES=${aiEnabled ? "true" : "false"}`);
    console.log(`Seeding ${ALL_QUESTIONS.length} challenges from dataset...`);

    for (const question of ALL_QUESTIONS) {
        const { dbFields, hiddenTestCases } = toDbPayload(question);

        const manualEdge = [
            ...hiddenTestCases,
            ...(MANUAL_EDGE_CASES_BY_SLUG[dbFields.slug] || []),
        ];

        const testCases = await enrichChallengeTestCases(dbFields, manualEdge);

        await CodingChallenge.findOneAndUpdate(
            { slug: dbFields.slug },
            {
                $set: {
                    ...dbFields,
                    testCases,
                },
            },
            { upsert: true, new: true }
        );

        console.log(`Seeded: ${dbFields.title} (${testCases.length} test cases)`);
    }

    console.log(`Done. ${ALL_QUESTIONS.length} challenges seeded.`);
    await mongoose.connection.close();
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
