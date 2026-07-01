const mongoose = require("mongoose");

const userTopicAnalyticsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        topic: { type: String, required: true, trim: true, index: true },
        category: {
            type: String,
            enum: ["technical", "behavioral", "mock", "general"],
            default: "technical",
        },
        source: {
            type: String,
            enum: ["coding", "behavioral", "mock", "session"],
            default: "coding",
        },
        attempts: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        incorrect: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        weakScore: { type: Number, default: 50 },
        successRate: { type: Number, default: 0 },
        lastAttempted: { type: Date, default: null },
        trend: {
            type: String,
            enum: ["improving", "stable", "declining"],
            default: "stable",
        },
        recentScores: [{ type: Number }],
    },
    { timestamps: true }
);

userTopicAnalyticsSchema.index({ user: 1, topic: 1 }, { unique: true });
userTopicAnalyticsSchema.index({ user: 1, weakScore: -1 });
userTopicAnalyticsSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("UserTopicAnalytics", userTopicAnalyticsSchema);
