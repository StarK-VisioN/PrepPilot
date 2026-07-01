const mongoose = require("mongoose");

const exampleSchema = new mongoose.Schema(
    {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String, default: "" },
    },
    { _id: false }
);

const testCaseSchema = new mongoose.Schema(
    {
        input: { type: mongoose.Schema.Types.Mixed, required: true },
        expected: { type: mongoose.Schema.Types.Mixed, required: true },
        isHidden: { type: Boolean, default: false },
        type: {
            type: String,
            enum: ["visible", "hidden", "edge", "stress"],
            default: "visible",
        },
        explanation: { type: String, default: "" },
        label: { type: String, default: "" },
    },
    { _id: false }
);

const codingChallengeSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        description: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            required: true,
        },
        tags: [{ type: String, trim: true }],
        examples: [exampleSchema],
        constraints: [{ type: String }],
        starterCode: { type: mongoose.Schema.Types.Mixed, required: true },
        supportedLanguages: {
            type: [String],
            default: ["javascript"],
        },
        testCases: {
            type: [testCaseSchema],
            validate: {
                validator: (cases) => Array.isArray(cases) && cases.length > 0,
                message: "At least one test case is required",
            },
        },
        functionName: { type: String, required: true },
        functionNameByLanguage: { type: mongoose.Schema.Types.Mixed, default: null },
        expectedInputFormat: {
            type: String,
            enum: ["spread", "single"],
            default: "spread",
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

codingChallengeSchema.index({ difficulty: 1, isActive: 1 });

module.exports = mongoose.model("CodingChallenge", codingChallengeSchema);
