const { getReadinessLabel } = require("../utils/analyticsTopics");

function buildScoreBreakdown(topics, summary) {
    const byCategory = {
        technical: [],
        behavioral: [],
        mock: [],
        general: [],
    };

    for (const t of topics) {
        if (byCategory[t.category]) byCategory[t.category].push(t);
    }

    const avg = (arr) =>
        arr.length > 0
            ? Math.round(arr.reduce((s, x) => s + (x.averageScore || 0), 0) / arr.length)
            : 0;

    const technicalFromTopics = avg(byCategory.technical);
    const behavioralFromTopics = avg(byCategory.behavioral);
    const mockFromTopics = avg(byCategory.mock);

    const codingScore =
        summary.coding.totalSubmissions > 0
            ? Math.round(
                  (summary.coding.challengesSolved /
                      Math.max(summary.coding.uniqueChallenges, 1)) *
                      100
              )
            : technicalFromTopics;

    const behavioralScore =
        summary.behavioral.averageScore ?? behavioralFromTopics;

    const communicationTopics = topics.filter(
        (t) => t.topic === "Communication" || t.topic === "Clarity" || t.topic === "Confidence"
    );
    const communicationScore =
        communicationTopics.length > 0
            ? avg(communicationTopics)
            : summary.mock.averageScore ?? mockFromTopics;

    const technicalScore = Math.round(
        (codingScore * 0.6 + technicalFromTopics * 0.4) || codingScore || technicalFromTopics
    );

    const overall = Math.round(
        technicalScore * 0.35 +
            codingScore * 0.25 +
            (behavioralScore || 0) * 0.2 +
            (communicationScore || 0) * 0.2
    );

    return {
        technicalScore,
        codingScore,
        behavioralScore: behavioralScore || 0,
        communicationScore: communicationScore || 0,
        overallReadiness: overall,
        readinessLabel: getReadinessLabel(overall),
    };
}

function getWeakTopics(topics, limit = 8) {
    return [...topics]
        .filter((t) => t.attempts > 0)
        .sort((a, b) => b.weakScore - a.weakScore || b.attempts - a.attempts)
        .slice(0, limit)
        .map((t) => ({
            topic: t.topic,
            category: t.category,
            weakScore: t.weakScore,
            averageScore: t.averageScore,
            attempts: t.attempts,
            successRate: t.successRate,
            trend: t.trend,
            lastAttempted: t.lastAttempted,
        }));
}

function getStrongTopics(topics, limit = 5) {
    return [...topics]
        .filter((t) => t.attempts > 0 && t.averageScore >= 70)
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, limit)
        .map((t) => ({
            topic: t.topic,
            averageScore: t.averageScore,
            attempts: t.attempts,
        }));
}

function buildImprovementTrend(topics, behavioral, mock, coding) {
    const weekly = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        const key = d.toISOString().slice(0, 10);
        weekly[key] = { week: `W${7 - i}`, scores: [], avg: 0 };
    }

    for (const t of topics) {
        if (!t.lastAttempted) continue;
        const age = (now - new Date(t.lastAttempted)) / (7 * 24 * 60 * 60 * 1000);
        const weekIdx = Math.min(6, Math.max(0, 6 - Math.floor(age)));
        const keys = Object.keys(weekly);
        if (keys[weekIdx]) {
            weekly[keys[weekIdx]].scores.push(t.averageScore);
        }
    }

    return Object.values(weekly).map((w) => ({
        week: w.week,
        score:
            w.scores.length > 0
                ? Math.round(w.scores.reduce((a, b) => a + b, 0) / w.scores.length)
                : 0,
    }));
}

function buildActivityHeatmap(topics) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const heatmap = days.map((day) => ({ day, count: 0 }));

    for (const t of topics) {
        if (!t.lastAttempted) continue;
        const d = new Date(t.lastAttempted);
        heatmap[d.getDay()].count += t.attempts;
    }

    const max = Math.max(...heatmap.map((h) => h.count), 1);
    return heatmap.map((h) => ({
        ...h,
        intensity: Math.round((h.count / max) * 100),
    }));
}

function buildTopicAccuracy(topics) {
    return topics
        .filter((t) => t.attempts > 0)
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 12)
        .map((t) => ({
            topic: t.topic,
            accuracy: t.successRate || t.averageScore,
            attempts: t.attempts,
        }));
}

function buildRadarData(scores) {
    return [
        { skill: "Technical", score: scores.technicalScore },
        { skill: "Coding", score: scores.codingScore },
        { skill: "Behavioral", score: scores.behavioralScore },
        { skill: "Communication", score: scores.communicationScore },
    ];
}

module.exports = {
    buildScoreBreakdown,
    getWeakTopics,
    getStrongTopics,
    buildImprovementTrend,
    buildActivityHeatmap,
    buildTopicAccuracy,
    buildRadarData,
};
