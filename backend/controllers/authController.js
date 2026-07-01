const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const formatUserResponse = require("../utils/formatUserResponse");
const { AUTH_PROVIDERS } = require("../constants/authProviders");
const {
    verifyGoogleIdToken,
    exchangeAuthorizationCode,
    findOrCreateGoogleUser,
    getGoogleAuthUrl,
} = require("../services/googleAuthService");

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, and password",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            profileImageUrl: profileImageUrl || null,
            provider: AUTH_PROVIDERS.LOCAL,
            isEmailVerified: false,
        });

        res.status(201).json({
            success: true,
            data: formatUserResponse(user, generateToken(user._id)),
            message: "Registration successful",
        });
    } catch (err) {
        console.error("Registration error:", err);

        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation error: " + err.message,
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error during registration",
            error: process.env.NODE_ENV === "production" ? {} : err.message,
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: "This account uses Google sign-in. Please continue with Google.",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        res.json({
            success: true,
            data: formatUserResponse(user, generateToken(user._id)),
            message: "Login successful",
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({
            success: false,
            message: "Server error during login",
            error: process.env.NODE_ENV === "production" ? {} : err.message,
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            data: formatUserResponse(user),
        });
    } catch (err) {
        console.error("Get profile error:", err);
        res.status(500).json({
            success: false,
            message: "Server error while fetching profile",
            error: process.env.NODE_ENV === "production" ? {} : err.message,
        });
    }
};

const logoutUser = async (_req, res) => {
    res.json({
        success: true,
        message: "Logged out successfully",
    });
};

const googleAuth = async (req, res) => {
    try {
        const { credential, idToken, linkAccount } = req.body;
        const token = credential || idToken;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required",
            });
        }

        const googleProfile = await verifyGoogleIdToken(token);
        const { user, isNewUser, linked } = await findOrCreateGoogleUser(googleProfile, {
            linkOnly: Boolean(linkAccount),
        });

        const message = isNewUser
            ? "Account created with Google"
            : linked
              ? "Google account linked successfully"
              : "Login successful";

        res.json({
            success: true,
            data: formatUserResponse(user, generateToken(user._id)),
            message,
            meta: { isNewUser, linked },
        });
    } catch (err) {
        console.error("Google auth error:", err);
        const status = err.statusCode || 401;
        res.status(status).json({
            success: false,
            message: err.message || "Google authentication failed",
        });
    }
};

const linkGoogleAccount = async (req, res) => {
    try {
        const { credential, idToken } = req.body;
        const token = credential || idToken;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required",
            });
        }

        const googleProfile = await verifyGoogleIdToken(token);

        if (googleProfile.email !== req.user.email?.toLowerCase().trim()) {
            return res.status(400).json({
                success: false,
                message: "Google account email must match your account email",
            });
        }

        const existingGoogleUser = await User.findOne({ googleId: googleProfile.googleId });
        if (existingGoogleUser && existingGoogleUser._id.toString() !== req.user.id) {
            return res.status(409).json({
                success: false,
                message: "This Google account is already linked to another user",
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.googleId) {
            return res.status(400).json({
                success: false,
                message: "Google account is already connected",
            });
        }

        user.googleId = googleProfile.googleId;
        user.isEmailVerified = true;
        if (!user.profileImageUrl && googleProfile.profileImageUrl) {
            user.profileImageUrl = googleProfile.profileImageUrl;
        }
        await user.save();

        res.json({
            success: true,
            data: formatUserResponse(user),
            message: "Google account connected successfully",
        });
    } catch (err) {
        console.error("Link Google account error:", err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to connect Google account",
        });
    }
};

const googleAuthRedirect = (_req, res) => {
    try {
        const url = getGoogleAuthUrl();
        res.redirect(url);
    } catch (err) {
        console.error("Google redirect error:", err);
        res.status(500).json({
            success: false,
            message: err.message || "Google OAuth is not configured",
        });
    }
};

const googleAuthCallback = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    try {
        const { code, error } = req.query;

        if (error) {
            return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error)}`);
        }

        if (!code) {
            return res.redirect(`${frontendUrl}/login?error=missing_code`);
        }

        const googleProfile = await exchangeAuthorizationCode(code);
        const { user } = await findOrCreateGoogleUser(googleProfile);
        const token = generateToken(user._id);

        res.redirect(`${frontendUrl}/auth/google/callback?token=${encodeURIComponent(token)}`);
    } catch (err) {
        console.error("Google callback error:", err);
        res.redirect(
            `${frontendUrl}/login?error=${encodeURIComponent(err.message || "google_auth_failed")}`
        );
    }
};

const testDBConnection = async (_req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.json({
            success: true,
            message: "Database connected successfully",
            userCount,
        });
    } catch (err) {
        console.error("Database connection test failed:", err);
        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: err.message,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    logoutUser,
    googleAuth,
    linkGoogleAccount,
    googleAuthRedirect,
    googleAuthCallback,
    testDBConnection,
};
