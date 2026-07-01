const mongoose = require("mongoose");

const ROLES = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Data Engineer",
    "Product Manager",
    "Custom Job Description",
];

const PERSONALITIES = ["friendly", "strict", "faang", "startup-founder", "senior-engineer"];

const feedbackSchema = new mongoose.Schema(
    {
        communication: { type: Number, min: 0, max: 100, default: 0 },
        technicalKnowledge: { type: Number, min: 0, max: 100, default: 0 },
        problemSolving: { type: Number, min: 0, max: 100, default: 0 },
        confidence: { type: Number, min: 0, max: 100, default: 0 },
        clarity: { type: Number, min: 0, max: 100, default: 0 },
        correctness: { type: Number, min: 0, max: 100, default: 0 },
        depth: { type: Number, min: 0, max: 100, default: 0 },
        systemDesign: { type: Number, min: 0, max: 100, default: 0 },
        tradeoffThinking: { type: Number, min: 0, max: 100, default: 0 },
        scalabilityUnderstanding: { type: Number, min: 0, max: 100, default: 0 },
        starSituation: { type: Number, min: 0, max: 25, default: 0 },
        starTask: { type: Number, min: 0, max: 25, default: 0 },
        starAction: { type: Number, min: 0, max: 25, default: 0 },
        starResult: { type: Number, min: 0, max: 25, default: 0 },
        strengths: [{ type: String }],
        weaknesses: [{ type: String }],
        recommendations: [{ type: String }],
        overallScore: { type: Number, min: 0, max: 100, default: 0 },
        aiAvailable: { type: Boolean, default: true },
    },
    { _id: false }
);

const mockInterviewSessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        role: { type: String, required: true, trim: true },
        customRole: { type: String, default: "" },
        interviewType: {
            type: String,
            enum: ["Technical", "Behavioral", "Mixed"],
            required: true,
        },
        difficulty: {
            type: String,
            enum: ["Beginner", "Intermediate", "Senior"],
            required: true,
        },
        duration: { type: Number, required: true },
        personality: {
            type: String,
            enum: PERSONALITIES,
            default: "friendly",
        },
        sourceType: {
            type: String,
            enum: ["preset", "jd", "resume"],
            default: "preset",
        },
        jobDescription: { type: String, default: "" },
        resumeText: { type: String, default: "" },
        status: {
            type: String,
            enum: ["active", "completed", "abandoned"],
            default: "active",
            index: true,
        },
        startedAt: { type: Date, default: Date.now },
        completedAt: { type: Date, default: null },
        questionCount: { type: Number, default: 0 },
        score: { type: Number, min: 0, max: 100, default: null },
        summary: { type: String, default: "" },
        feedback: { type: feedbackSchema, default: () => ({}) },
        currentTopic: { type: String, default: "" },
    },
    { timestamps: true }
);

mockInterviewSessionSchema.index({ user: 1, createdAt: -1 });
mockInterviewSessionSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("MockInterviewSession", mockInterviewSessionSchema);
module.exports.ROLES = ROLES;
module.exports.PERSONALITIES = PERSONALITIES;
