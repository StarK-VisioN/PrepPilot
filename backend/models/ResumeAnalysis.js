const mongoose = require("mongoose");

const learningRoadmapWeekSchema = new mongoose.Schema(
    {
        week: { type: String, default: "" },
        focus: { type: String, default: "" },
        topics: [{ type: String }],
        tasks: [{ type: String }],
    },
    { _id: false }
);

const resumeAnalysisSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        fileName: { type: String, required: true, trim: true },
        extractedText: { type: String, required: true },
        atsScore: { type: Number, default: 0, min: 0, max: 100 },
        summary: { type: String, default: "" },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        missingSkills: [{ type: String }],
        keywordMatch: {
            matched: [{ type: String }],
            missing: [{ type: String }],
        },
        formattingFeedback: [{ type: String }],
        roleFit: {
            score: { type: Number, default: 0, min: 0, max: 100 },
            bestFitRoles: [{ type: String }],
            notSuitableRoles: [{ type: String }],
        },
        improvementSuggestions: [{ type: String }],
        recommendedTopics: [{ type: String }],
        learningRoadmap: [learningRoadmapWeekSchema],
        analysisStatus: {
            type: String,
            enum: ["complete", "text_only"],
            default: "complete",
        },
        aiAvailable: { type: Boolean, default: true },
    },
    { timestamps: true }
);

resumeAnalysisSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
