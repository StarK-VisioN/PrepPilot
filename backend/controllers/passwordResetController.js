const { requestPasswordReset, resetPasswordWithToken } = require("../services/passwordResetService");
const { checkForgotPasswordRateLimit } = require("../utils/forgotPasswordRateLimit");
const { validatePassword } = require("../utils/validatePassword");

const forgotPassword = async (req, res) => {
    try {
        const email = req.body?.email?.toLowerCase().trim();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please provide your email address",
            });
        }

        const rateLimit = await checkForgotPasswordRateLimit(email, req.ip);
        if (!rateLimit.allowed) {
            return res.status(429).json({
                success: false,
                message: rateLimit.message,
            });
        }

        const result = await requestPasswordReset(email);

        res.json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        console.error("Forgot password error:", error);

        if (process.env.NODE_ENV !== "production" && error.message?.includes("SMTP")) {
            return res.status(503).json({
                success: false,
                message: "Email service is not configured. Check server logs in development.",
            });
        }

        res.status(500).json({
            success: false,
            message: "Unable to process password reset request",
            error: process.env.NODE_ENV === "production" ? {} : error.message,
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Reset token is required",
            });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({
                success: false,
                message: passwordError,
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        await resetPasswordWithToken(token, password);

        res.json({
            success: true,
            message: "Password reset successfully. Please log in again.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to reset password",
        });
    }
};

module.exports = {
    forgotPassword,
    resetPassword,
};
