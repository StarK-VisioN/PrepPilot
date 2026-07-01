const mongoose = require("mongoose");

const BEHAVIORAL_CATEGORIES = [
    "Leadership",
    "Conflict Resolution",
    "Teamwork",
    "Ownership",
    "Failure & Learning",
    "Communication",
    "Problem Solving",
    "Time Management",
    "Adaptability",
    "Customer Obsession",
    "Project Management",
    "Decision Making",
];

const behavioralQuestionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        question: { type: String, required: true },
        category: {
            type: String,
            enum: BEHAVIORAL_CATEGORIES,
            required: true,
            index: true,
        },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Medium",
            index: true,
        },
        hints: [{ type: String }],
        sampleAnswer: { type: String, default: "" },
        tags: [{ type: String, trim: true }],
        companyTags: [{ type: String, trim: true }],
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

behavioralQuestionSchema.index({ category: 1, order: 1, isActive: 1 });
behavioralQuestionSchema.index({ question: "text", title: "text" });

module.exports = mongoose.model("BehavioralQuestion", behavioralQuestionSchema);
module.exports.BEHAVIORAL_CATEGORIES = BEHAVIORAL_CATEGORIES;
