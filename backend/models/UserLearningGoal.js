const mongoose = require("mongoose");

const userLearningGoalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        targetCompany: { type: String, default: "", trim: true },
        targetRole: { type: String, default: "Software Engineer", trim: true },
        targetInterviewDate: { type: Date, default: null },
        skillLevel: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Intermediate",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("UserLearningGoal", userLearningGoalSchema);
