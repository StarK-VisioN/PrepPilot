const mongoose = require("mongoose");

const mockInterviewMessageSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MockInterviewSession",
            required: true,
            index: true,
        },
        sender: {
            type: String,
            enum: ["ai", "user"],
            required: true,
        },
        message: { type: String, required: true },
        questionType: {
            type: String,
            enum: ["opening", "technical", "behavioral", "followup", "closing", "system"],
            default: "followup",
        },
        sequence: { type: Number, required: true },
    },
    { timestamps: true }
);

mockInterviewMessageSchema.index({ sessionId: 1, sequence: 1 });
mockInterviewMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model("MockInterviewMessage", mockInterviewMessageSchema);
