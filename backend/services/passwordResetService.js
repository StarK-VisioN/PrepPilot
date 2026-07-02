const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { AUTH_PROVIDERS } = require("../constants/authProviders");
const { sendPasswordResetEmail } = require("./emailService");

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_EXPIRY_MS = 30 * 60 * 1000;

const GENERIC_SUCCESS_MESSAGE =
    "If this email is registered, we have sent a password reset link.";

const hashResetToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

const generateResetToken = () => {
    const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
    return {
        rawToken,
        hashedToken: hashResetToken(rawToken),
    };
};

const isGoogleOnlyUser = (user) =>
    user.provider === AUTH_PROVIDERS.GOOGLE && !user.password;

const requestPasswordReset = async (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || isGoogleOnlyUser(user)) {
        return { sent: false, message: GENERIC_SUCCESS_MESSAGE };
    }

    const { rawToken, hashedToken } = generateResetToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
    await user.save();

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
    });

    return { sent: true, message: GENERIC_SUCCESS_MESSAGE };
};

const resetPasswordWithToken = async (rawToken, newPassword) => {
    const hashedToken = hashResetToken(rawToken);

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
        const error = new Error("This reset link is invalid or expired.");
        error.statusCode = 400;
        throw error;
    }

    if (isGoogleOnlyUser(user)) {
        const error = new Error(
            "This account uses Google Sign-In. Please continue with Google."
        );
        error.statusCode = 400;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return user;
};

module.exports = {
    requestPasswordReset,
    resetPasswordWithToken,
    hashResetToken,
    GENERIC_SUCCESS_MESSAGE,
    RESET_TOKEN_EXPIRY_MS,
};
