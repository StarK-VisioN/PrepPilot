const mongoose = require("mongoose");

const starSectionSchema = new mongoose.Schema(
    {
        present: { type: Boolean, default: false },
        score: { type: Number, min: 0, max: 25, default: 0 },
        feedback: { type: String, default: "" },
    },
    { _id: false }
);

const evaluationSchema = new mongoose.Schema(
    {
        situation: { type: starSectionSchema, default: () => ({}) },
        task: { type: starSectionSchema, default: () => ({}) },
        action: { type: starSectionSchema, default: () => ({}) },
        result: { type: starSectionSchema, default: () => ({}) },
        missingSections: [{ type: String }],
        overallFeedback: { type: String, default: "" },
        improvementSuggestions: [{ type: String }],
        ratingLabel: {
            type: String,
            enum: ["Excellent", "Good", "Average", "Needs Improvement", ""],
            default: "",
        },
        aiAvailable: { type: Boolean, default: true },
    },
    { _id: false }
);

const behavioralSubmissionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BehavioralQuestion",
            required: true,
            index: true,
        },
        answer: { type: String, required: true },
        evaluation: { type: evaluationSchema, default: () => ({}) },
        score: { type: Number, min: 0, max: 100, default: 0 },
        category: { type: String, index: true },
        attemptNumber: { type: Number, default: 1 },
    },
    { timestamps: true }
);

behavioralSubmissionSchema.index({ user: 1, questionId: 1, createdAt: -1 });
behavioralSubmissionSchema.index({ user: 1, createdAt: -1 });
behavioralSubmissionSchema.index({ createdAt: -1 });

module.exports = mongoose.model("BehavioralSubmission", behavioralSubmissionSchema);
