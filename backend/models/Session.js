const mongoose = require("mongoose");
const { VALID_COMPANY_IDS } = require("../utils/companies");

const sessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, required: true },
    experience: { type: String, required: true }, 
    topicsToFocus: { type: String, required: true },
    description: String,
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    // Phase 1 — all optional for backward compatibility with existing sessions
    sourceType: {
        type: String,
        enum: ["manual", "resume", "jd", "combined"],
        default: "manual",
    },
    company: {
        type: String,
        enum: VALID_COMPANY_IDS,
        default: "generic",
    },
    customCompanyName: { type: String, default: "" },
    skills: [{ type: String }],
    customSkills: { type: [String], default: [] },
    topicQuestionCache: [{
        topic: { type: String, required: true },
        questions: [{
            question: { type: String, required: true },
            answer: { type: String, required: true },
        }],
        generatedAt: { type: Date, default: Date.now },
    }],
    resumeDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", default: null },
    jdDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", default: null },
}, { timestamps: true });

module.exports = mongoose.model("Session", sessionSchema);
