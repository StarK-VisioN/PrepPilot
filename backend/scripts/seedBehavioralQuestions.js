require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const BehavioralQuestion = require("../models/BehavioralQuestion");
const allQuestions = require("../data/behavioralQuestions/index");
const { invalidateQuestionsCache } = require("../services/behavioralCacheService");

async function seed() {
    await connectDB();
    console.log(`Seeding ${allQuestions.length} behavioral questions...`);

    for (const question of allQuestions) {
        await BehavioralQuestion.findOneAndUpdate(
            { title: question.title, category: question.category },
            { $set: question },
            { upsert: true, new: true }
        );
        console.log(`Seeded: [${question.category}] ${question.title}`);
    }

    await invalidateQuestionsCache();
    console.log(`Done. ${allQuestions.length} behavioral questions seeded.`);
    await mongoose.connection.close();
    process.exit(0);
}

seed().catch((err) => {
    console.error("Behavioral seed failed:", err);
    process.exit(1);
});
