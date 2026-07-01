const UserTopicAnalytics = require("../models/UserTopicAnalytics");
const UserLearningGoal = require("../models/UserLearningGoal");
const { getUserId } = require("../utils/sessionOwnership");
const { buildFullAnalytics } = require("../services/analyticsWorker");
const {
    getCachedDashboard,
    getCachedRoadmap,
    getCachedRecommendations,
    getCachedTopics,
    invalidateAnalyticsCache,
} = require("../services/analyticsCacheService");
const { scheduleAnalyticsRefresh } = require("../services/analyticsWorker");

const getDashboard = async (req, res) => {
    try {
        const userId = getUserId(req);
        let dashboard = await getCachedDashboard(userId);

        if (!dashboard) {
            const result = await buildFullAnalytics(userId);
            dashboard = result.dashboard;
        }

        res.status(200).json({ success: true, dashboard });
    } catch (error) {
        console.error("getDashboard error:", error);
        res.status(500).json({ success: false, message: "Failed to load analytics dashboard" });
    }
};

const getTopics = async (req, res) => {
    try {
        const userId = getUserId(req);
        let topics = await getCachedTopics(userId);

        if (!topics) {
            const result = await buildFullAnalytics(userId);
            topics = result.topics;
        }

        res.status(200).json({
            success: true,
            topics: topics.map((t) => ({
                topic: t.topic,
                category: t.category,
                source: t.source,
                attempts: t.attempts,
                correct: t.correct,
                incorrect: t.incorrect,
                averageScore: t.averageScore,
                weakScore: t.weakScore,
                successRate: t.successRate,
                trend: t.trend,
                lastAttempted: t.lastAttempted,
            })),
        });
    } catch (error) {
        console.error("getTopics error:", error);
        res.status(500).json({ success: false, message: "Failed to load topic analytics" });
    }
};

const getRoadmap = async (req, res) => {
    try {
        const userId = getUserId(req);
        let roadmap = await getCachedRoadmap(userId);

        if (!roadmap) {
            const result = await buildFullAnalytics(userId);
            roadmap = result.roadmap;
        }

        res.status(200).json({ success: true, roadmap });
    } catch (error) {
        console.error("getRoadmap error:", error);
        res.status(500).json({ success: false, message: "Failed to load roadmap" });
    }
};

const getRecommendations = async (req, res) => {
    try {
        const userId = getUserId(req);
        let recommendations = await getCachedRecommendations(userId);

        if (!recommendations) {
            const result = await buildFullAnalytics(userId);
            recommendations = result.recommendations;
        }

        res.status(200).json({ success: true, recommendations });
    } catch (error) {
        console.error("getRecommendations error:", error);
        res.status(500).json({ success: false, message: "Failed to load recommendations" });
    }
};

const saveGoals = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { targetCompany, targetRole, targetInterviewDate, skillLevel } = req.body;

        const goals = await UserLearningGoal.findOneAndUpdate(
            { user: userId },
            {
                $set: {
                    targetCompany: targetCompany || "",
                    targetRole: targetRole || "Software Engineer",
                    targetInterviewDate: targetInterviewDate
                        ? new Date(targetInterviewDate)
                        : null,
                    skillLevel: ["Beginner", "Intermediate", "Advanced"].includes(skillLevel)
                        ? skillLevel
                        : "Intermediate",
                },
            },
            { upsert: true, new: true }
        );

        await invalidateAnalyticsCache(userId);
        scheduleAnalyticsRefresh(userId);

        res.status(200).json({ success: true, goals });
    } catch (error) {
        console.error("saveGoals error:", error);
        res.status(500).json({ success: false, message: "Failed to save goals" });
    }
};

const getGoals = async (req, res) => {
    try {
        const userId = getUserId(req);
        const goals = await UserLearningGoal.findOne({ user: userId });
        res.status(200).json({ success: true, goals: goals || null });
    } catch (error) {
        console.error("getGoals error:", error);
        res.status(500).json({ success: false, message: "Failed to load goals" });
    }
};

const getHistory = async (req, res) => {
    try {
        const userId = getUserId(req);
        const topics = await UserTopicAnalytics.find({ user: userId })
            .sort({ updatedAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            history: topics.map((t) => ({
                topic: t.topic,
                category: t.category,
                averageScore: t.averageScore,
                weakScore: t.weakScore,
                attempts: t.attempts,
                trend: t.trend,
                updatedAt: t.updatedAt,
            })),
        });
    } catch (error) {
        console.error("getHistory error:", error);
        res.status(500).json({ success: false, message: "Failed to load analytics history" });
    }
};

module.exports = {
    getDashboard,
    getTopics,
    getRoadmap,
    getRecommendations,
    saveGoals,
    getGoals,
    getHistory,
};
