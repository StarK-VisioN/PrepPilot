const { checkAndIncrementAiRateLimit, RATE_LIMIT_TTL } = require("../utils/rateLimit");
const { getUserId } = require("../utils/sessionOwnership");

async function aiRateLimitMiddleware(req, res, next) {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return next();
        }

        const result = await checkAndIncrementAiRateLimit(userId);

        if (!result.allowed) {
            return res.status(429).json({
                message:
                    "You have reached today's AI usage limit. Please try again tomorrow.",
                isRetryable: true,
                retryAfter: RATE_LIMIT_TTL,
            });
        }

        return next();
    } catch (error) {
        console.warn("AI rate limit middleware error:", error.message);
        return next();
    }
}

module.exports = aiRateLimitMiddleware;
