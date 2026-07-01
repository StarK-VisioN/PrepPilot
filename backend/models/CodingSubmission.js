const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
    {
        label: { type: String, default: "" },
        passed: { type: Boolean, required: true },
        input: { type: mongoose.Schema.Types.Mixed },
        expected: { type: mongoose.Schema.Types.Mixed },
        actual: { type: mongoose.Schema.Types.Mixed },
        error: { type: String, default: null },
        runtimeMs: { type: Number, default: 0 },
        isHidden: { type: Boolean, default: false },
        type: {
            type: String,
            enum: ["visible", "hidden", "edge", "stress"],
            default: "visible",
        },
    },
    { _id: false }
);

const codingSubmissionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        challengeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CodingChallenge",
            required: true,
            index: true,
        },
        code: { type: String, required: true },
        language: {
            type: String,
            default: "javascript",
            enum: ["javascript"],
        },
        status: {
            type: String,
            enum: ["Accepted", "Failed", "Error"],
            required: true,
        },
        passedCount: { type: Number, default: 0 },
        totalCount: { type: Number, default: 0 },
        results: [resultSchema],
        runtimeMs: { type: Number, default: 0 },
        submittedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

codingSubmissionSchema.index({ user: 1, challengeId: 1, submittedAt: -1 });

module.exports = mongoose.model("CodingSubmission", codingSubmissionSchema);
