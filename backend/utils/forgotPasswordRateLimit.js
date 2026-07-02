const { getRedis, isRedisAvailable } = require("../config/redis");

const FORGOT_PASSWORD_LIMIT = 3;
const FORGOT_PASSWORD_TTL = 3600;

const forgotPasswordRateLimitKey = (identifier) => `rate:forgot-password:${identifier}`;

const checkForgotPasswordRateLimit = async (email, ip) => {
    if (!isRedisAvailable()) {
        return { allowed: true };
    }

    const normalizedEmail = email?.toLowerCase().trim();
    const keys = [];

    if (normalizedEmail) {
        keys.push(forgotPasswordRateLimitKey(normalizedEmail));
    }

    if (ip) {
        keys.push(forgotPasswordRateLimitKey(ip));
    }

    try {
        const redis = getRedis();

        for (const key of keys) {
            const count = await redis.incr(key);

            if (count === 1) {
                await redis.expire(key, FORGOT_PASSWORD_TTL);
            }

            if (count > FORGOT_PASSWORD_LIMIT) {
                return {
                    allowed: false,
                    message: "Too many reset requests. Please try again later.",
                };
            }
        }

        return { allowed: true };
    } catch (error) {
        console.warn("Forgot password rate limit check failed:", error.message);
        return { allowed: true };
    }
};

module.exports = {
    checkForgotPasswordRateLimit,
    FORGOT_PASSWORD_LIMIT,
    FORGOT_PASSWORD_TTL,
};
