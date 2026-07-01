const mongoose = require("mongoose");
const UserTopicAnalytics = require("../models/UserTopicAnalytics");
const CodingSubmission = require("../models/CodingSubmission");
const CodingChallenge = require("../models/CodingChallenge");
const BehavioralSubmission = require("../models/BehavioralSubmission");
const MockInterviewSession = require("../models/MockInterviewSession");
const Session = require("../models/Session");
const Question = require("../models/Question");
const {
    normalizeTopic,
    parseTopicsFromString,
    MOCK_DIMENSION_TOPICS,
} = require("../utils/analyticsTopics");

function computeTrend(recentScores) {
    if (!recentScores || recentScores.length < 2) return "stable";
    const half = Math.floor(recentScores.length / 2);
    const first = recentScores.slice(0, half);
    const second = recentScores.slice(half);
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const diff = avg(second) - avg(first);
    if (diff > 5) return "improving";
    if (diff < -5) return "declining";
    return "stable";
}

function upsertTopic(map, key, update) {
    const existing = map.get(key) || {
        topic: update.topic,
        category: update.category,
        source: update.source,
        attempts: 0,
        correct: 0,
        incorrect: 0,
        scoreSum: 0,
        recentScores: [],
        lastAttempted: null,
    };

    existing.attempts += update.attempts || 0;
    existing.correct += update.correct || 0;
    existing.incorrect += update.incorrect || 0;
    existing.scoreSum += update.score || 0;
    if (update.score !== undefined) {
        existing.recentScores.push(update.score);
        if (existing.recentScores.length > 10) existing.recentScores.shift();
    }
    if (update.lastAttempted) {
        existing.lastAttempted = update.lastAttempted;
    }

    map.set(key, existing);
}

async function collectCodingMetrics(userId, topicMap) {
    const submissions = await CodingSubmission.find({ user: userId })
        .sort({ submittedAt: -1 })
        .limit(500)
        .populate("challengeId", "tags title difficulty");

    const challengeIds = [...new Set(submissions.map((s) => s.challengeId?._id).filter(Boolean))];
    const solvedChallenges = new Set(
        submissions.filter((s) => s.status === "Accepted").map((s) => String(s.challengeId?._id))
    );

    for (const sub of submissions) {
        const challenge = sub.challengeId;
        if (!challenge) continue;

        const tags = challenge.tags?.length ? challenge.tags : ["Problem Solving"];
        const score =
            sub.totalCount > 0
                ? Math.round((sub.passedCount / sub.totalCount) * 100)
                : sub.status === "Accepted"
                  ? 100
                  : 0;
        const isCorrect = sub.status === "Accepted";

        for (const tag of tags) {
            const topic = normalizeTopic(tag) || "Problem Solving";
            const key = `coding:${topic}`;
            upsertTopic(topicMap, key, {
                topic,
                category: "technical",
                source: "coding",
                attempts: 1,
                correct: isCorrect ? 1 : 0,
                incorrect: isCorrect ? 0 : 1,
                score,
                lastAttempted: sub.submittedAt || sub.createdAt,
            });
        }
    }

    return {
        totalSubmissions: submissions.length,
        challengesSolved: solvedChallenges.size,
        uniqueChallenges: challengeIds.length,
    };
}

async function collectBehavioralMetrics(userId, topicMap) {
    const submissions = await BehavioralSubmission.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(300);

    const uniqueQuestions = new Set(submissions.map((s) => String(s.questionId)));

    for (const sub of submissions) {
        const topic = sub.category || "Communication";
        const score = sub.score || 0;
        const isCorrect = score >= 60;
        const key = `behavioral:${topic}`;

        upsertTopic(topicMap, key, {
            topic,
            category: "behavioral",
            source: "behavioral",
            attempts: 1,
            correct: isCorrect ? 1 : 0,
            incorrect: isCorrect ? 0 : 1,
            score,
            lastAttempted: sub.createdAt,
        });

        const eval_ = sub.evaluation || {};
        for (const star of ["situation", "task", "action", "result"]) {
            const section = eval_[star];
            if (section?.score !== undefined) {
                const starTopic = "STAR Responses";
                const starKey = `behavioral:${starTopic}`;
                upsertTopic(topicMap, starKey, {
                    topic: starTopic,
                    category: "behavioral",
                    source: "behavioral",
                    attempts: 1,
                    correct: section.score >= 15 ? 1 : 0,
                    incorrect: section.score >= 15 ? 0 : 1,
                    score: Math.round((section.score / 25) * 100),
                    lastAttempted: sub.createdAt,
                });
            }
        }
    }

    return {
        totalAttempts: submissions.length,
        uniqueQuestions: uniqueQuestions.size,
        averageScore:
            submissions.length > 0
                ? Math.round(
                      submissions.reduce((s, x) => s + (x.score || 0), 0) / submissions.length
                  )
                : null,
    };
}

async function collectMockInterviewMetrics(userId, topicMap) {
    const sessions = await MockInterviewSession.find({
        user: userId,
        status: "completed",
    })
        .sort({ completedAt: -1 })
        .limit(50);

    for (const session of sessions) {
        const fb = session.feedback || {};
        for (const [field, topic] of Object.entries(MOCK_DIMENSION_TOPICS)) {
            const score = fb[field];
            if (typeof score !== "number" || score <= 0) continue;

            const normalizedScore =
                field.startsWith("star") ? Math.round((score / 25) * 100) : score;
            const key = `mock:${topic}`;
            upsertTopic(topicMap, key, {
                topic,
                category: "mock",
                source: "mock",
                attempts: 1,
                correct: normalizedScore >= 60 ? 1 : 0,
                incorrect: normalizedScore >= 60 ? 0 : 1,
                score: normalizedScore,
                lastAttempted: session.completedAt || session.updatedAt,
            });
        }
    }

    const scores = sessions.map((s) => s.score).filter((s) => s > 0);
    return {
        completed: sessions.length,
        averageScore:
            scores.length > 0
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : null,
    };
}

async function collectSessionMetrics(userId, topicMap) {
    const sessions = await Session.find({ user: userId }).sort({ createdAt: -1 }).limit(30);
    let totalQuestions = 0;

    for (const session of sessions) {
        const topics = [
            ...parseTopicsFromString(session.topicsToFocus),
            ...(session.skills || []).map(normalizeTopic).filter(Boolean),
            ...(session.customSkills || []).map(normalizeTopic).filter(Boolean),
        ];

        const questions = await Question.countDocuments({ session: session._id });
        totalQuestions += questions;

        const topicList = topics.length ? topics : [normalizeTopic(session.role) || "General"];
        for (const topic of topicList) {
            const key = `session:${topic}`;
            upsertTopic(topicMap, key, {
                topic,
                category: "technical",
                source: "session",
                attempts: Math.max(questions, 1),
                correct: 0,
                incorrect: 0,
                score: 50,
                lastAttempted: session.updatedAt,
            });
        }
    }

    return { sessions: sessions.length, totalQuestions };
}

async function persistTopicMap(userId, topicMap) {
    const ops = [];

    for (const [, data] of topicMap) {
        const averageScore =
            data.attempts > 0 ? Math.round(data.scoreSum / data.attempts) : 0;
        const successRate =
            data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0;
        const weakScore = Math.max(0, Math.min(100, 100 - averageScore));

        ops.push(
            UserTopicAnalytics.findOneAndUpdate(
                { user: userId, topic: data.topic },
                {
                    $set: {
                        category: data.category,
                        source: data.source,
                        attempts: data.attempts,
                        correct: data.correct,
                        incorrect: data.incorrect,
                        averageScore,
                        weakScore,
                        successRate,
                        lastAttempted: data.lastAttempted,
                        trend: computeTrend(data.recentScores),
                        recentScores: data.recentScores,
                    },
                },
                { upsert: true, new: true }
            )
        );
    }

    await Promise.all(ops);
    return UserTopicAnalytics.find({ user: userId }).sort({ weakScore: -1 });
}

async function recalculateUserAnalytics(userId) {
    const topicMap = new Map();

    const [coding, behavioral, mock, session] = await Promise.all([
        collectCodingMetrics(userId, topicMap),
        collectBehavioralMetrics(userId, topicMap),
        collectMockInterviewMetrics(userId, topicMap),
        collectSessionMetrics(userId, topicMap),
    ]);

    const topics = await persistTopicMap(userId, topicMap);

    return {
        topics,
        summary: {
            coding,
            behavioral,
            mock,
            session,
        },
    };
}

module.exports = {
    recalculateUserAnalytics,
    computeTrend,
};
