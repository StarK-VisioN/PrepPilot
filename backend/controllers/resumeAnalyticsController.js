const { getUserId } = require("../utils/sessionOwnership");
const {
    uploadAndAnalyzeResume,
    getLatestResumeAnalysis,
    getResumeAnalysisHistory,
    deleteResumeAnalysis,
} = require("../services/resumeAnalysisService");
const { invalidateAnalyticsCache } = require("../services/analyticsCacheService");
const { scheduleAnalyticsRefresh } = require("../services/analyticsWorker");

const uploadResume = async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No resume file uploaded." });
        }

        const analysis = await uploadAndAnalyzeResume(userId, req.file);

        await invalidateAnalyticsCache(userId);
        scheduleAnalyticsRefresh(userId);

        res.status(201).json({ success: true, analysis });
    } catch (error) {
        console.error("uploadResume error:", error);

        const isClientError =
            error.message?.includes("PDF") ||
            error.message?.includes("file") ||
            error.message?.includes("upload") ||
            error.message?.includes("extract") ||
            error.message?.includes("Only PDF");

        res.status(isClientError ? 400 : 500).json({
            success: false,
            message: isClientError
                ? error.message
                : "Failed to process resume. Please try again.",
        });
    }
};

const getLatestResume = async (req, res) => {
    try {
        const userId = getUserId(req);
        const analysis = await getLatestResumeAnalysis(userId);

        res.status(200).json({ success: true, analysis });
    } catch (error) {
        console.error("getLatestResume error:", error);
        res.status(500).json({ success: false, message: "Failed to load resume analysis" });
    }
};

const getResumeHistory = async (req, res) => {
    try {
        const userId = getUserId(req);
        const history = await getResumeAnalysisHistory(userId);

        res.status(200).json({ success: true, history });
    } catch (error) {
        console.error("getResumeHistory error:", error);
        res.status(500).json({ success: false, message: "Failed to load resume history" });
    }
};

const deleteResume = async (req, res) => {
    try {
        const userId = getUserId(req);
        const deleted = await deleteResumeAnalysis(userId, req.params.id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Resume analysis not found" });
        }

        await invalidateAnalyticsCache(userId);
        scheduleAnalyticsRefresh(userId);

        res.status(200).json({ success: true, message: "Resume analysis deleted" });
    } catch (error) {
        console.error("deleteResume error:", error);
        res.status(500).json({ success: false, message: "Failed to delete resume analysis" });
    }
};

module.exports = {
    uploadResume,
    getLatestResume,
    getResumeHistory,
    deleteResume,
};
