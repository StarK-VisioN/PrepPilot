const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ["resume", "jd"], required: true },
        originalName: { type: String, default: "pasted-text.txt" },
        mimeType: { type: String, default: "text/plain" },
        parsedText: { type: String, required: true },
        extractedData: {
            role: String,
            experience: String,
            skills: [String],
            technologies: [String],
            projects: [String],
            responsibilities: [String],
            requirements: [String],
            summary: String,
        },
        fileUrl: { type: String, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
