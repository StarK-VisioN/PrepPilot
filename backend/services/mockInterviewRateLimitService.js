const { getRedis, isRedisAvailable } = require("../config/redis");

const DAILY_TTL = 86400;
const MINUTE_TTL = 60;

function getDailyInterviewLimit() {
    const parsed = parseInt(process.env.MOCK_INTERVIEW_DAILY_LIMIT || "5", 10);
    return Number.isNaN(parsed) || parsed < 1 ? 5 : parsed;
}

function getMessagesPerMinuteLimit() {
    const parsed = parseInt(process.env.MOCK_INTERVIEW_MSG_PER_MIN || "15", 10);
    return Number.isNaN(parsed) || parsed < 1 ? 15 : parsed;
}

async function checkAndIncrementDailyInterviews(userId) {
    const limit = getDailyInterviewLimit();
    if (!userId || !isRedisAvailable()) {
        return { allowed: true, count: 0, limit };
    }

    const key = `mockInterview:daily:${userId}`;
    try {
        const count = await getRedis().incr(key);
        if (count === 1) await getRedis().expire(key, DAILY_TTL);
        return { allowed: count <= limit, count, limit };
    } catch {
        return { allowed: true, count: 0, limit };
    }
}

async function checkAndIncrementMessageRate(userId) {
    const limit = getMessagesPerMinuteLimit();
    if (!userId || !isRedisAvailable()) {
        return { allowed: true, count: 0, limit };
    }

    const key = `mockInterview:msg:${userId}`;
    try {
        const count = await getRedis().incr(key);
        if (count === 1) await getRedis().expire(key, MINUTE_TTL);
        return { allowed: count <= limit, count, limit };
    } catch {
        return { allowed: true, count: 0, limit };
    }
}

module.exports = {
    checkAndIncrementDailyInterviews,
    checkAndIncrementMessageRate,
    getDailyInterviewLimit,
    getMessagesPerMinuteLimit,
};
