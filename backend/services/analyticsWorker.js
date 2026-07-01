const { recalculateUserAnalytics } = require("./analyticsCollectorService");
const { generateRoadmap } = require("./analyticsRoadmapService");
const { generateRecommendations } = require("./analyticsRecommendationService");
const {
    invalidateAnalyticsCache,
    setCachedDashboard,
    setCachedRoadmap,
    setCachedRecommendations,
    setCachedTopics,
} = require("./analyticsCacheService");
const {
    buildScoreBreakdown,
    getWeakTopics,
    getStrongTopics,
    buildImprovementTrend,
    buildActivityHeatmap,
    buildTopicAccuracy,
    buildRadarData,
} = require("./analyticsScoringService");
const UserLearningGoal = require("../models/UserLearningGoal");

const pendingRefreshes = new Set();

async function buildFullAnalytics(userId) {
    const { topics, summary } = await recalculateUserAnalytics(userId);
    const goals = await UserLearningGoal.findOne({ user: userId });
    const scores = buildScoreBreakdown(topics, summary);
    const weakTopics = getWeakTopics(topics);
    const strongTopics = getStrongTopics(topics);

    const dashboard = {
        overallReadiness: scores.overallReadiness,
        readinessLabel: scores.readinessLabel,
        scores,
        totals: {
            phase1Questions: summary.session.totalQuestions,
            codingChallengesSolved: summary.coding.challengesSolved,
            codingSubmissions: summary.coding.totalSubmissions,
            behavioralAttempts: summary.behavioral.totalAttempts,
            behavioralUnique: summary.behavioral.uniqueQuestions,
            mockInterviewsCompleted: summary.mock.completed,
            sessionsCreated: summary.session.sessions,
        },
        averages: {
            behavioral: summary.behavioral.averageScore,
            mock: summary.mock.averageScore,
        },
        improvementTrend: buildImprovementTrend(topics, summary.behavioral, summary.mock, summary.coding),
        topicAccuracy: buildTopicAccuracy(topics),
        activityHeatmap: buildActivityHeatmap(topics),
        radarData: buildRadarData(scores),
        weakTopics,
        strongTopics,
        consistencyScore: Math.round(
            topics.filter((t) => t.attempts >= 2).length / Math.max(topics.length, 1) * 100
        ),
        generatedAt: new Date().toISOString(),
    };

    const roadmap = await generateRoadmap(userId, topics, goals);
    const recommendations = await generateRecommendations({
        scores,
        weakTopics,
        strongTopics,
        goals,
        summary,
    });

    await Promise.all([
        setCachedDashboard(userId, dashboard),
        setCachedRoadmap(userId, roadmap),
        setCachedRecommendations(userId, recommendations),
        setCachedTopics(userId, topics),
    ]);

    return { dashboard, roadmap, recommendations, topics, goals };
}

function scheduleAnalyticsRefresh(userId) {
    const id = String(userId);
    if (pendingRefreshes.has(id)) return;

    pendingRefreshes.add(id);
    invalidateAnalyticsCache(userId).finally(() => {
        setImmediate(async () => {
            try {
                await buildFullAnalytics(userId);
            } catch (error) {
                console.warn("[analytics-worker] refresh failed:", error.message);
            } finally {
                pendingRefreshes.delete(id);
            }
        });
    });
}

module.exports = {
    buildFullAnalytics,
    scheduleAnalyticsRefresh,
};
