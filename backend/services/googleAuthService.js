const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { AUTH_PROVIDERS } = require("../constants/authProviders");

const getGoogleClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        throw new Error("GOOGLE_CLIENT_ID is not configured");
    }
    return new OAuth2Client(clientId, process.env.GOOGLE_CLIENT_SECRET);
};

const verifyGoogleIdToken = async (idToken) => {
    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
        throw new Error("Invalid Google token payload");
    }

    return {
        googleId: payload.sub,
        email: payload.email?.toLowerCase().trim(),
        name: payload.name || payload.given_name || "Google User",
        profileImageUrl: payload.picture || null,
        isEmailVerified: payload.email_verified === true,
    };
};

const exchangeAuthorizationCode = async (code) => {
    const client = getGoogleClient();
    const redirectUri =
        process.env.GOOGLE_CALLBACK_URL ||
        `${process.env.FRONTEND_URL || "http://localhost:8000"}/api/auth/google/callback`;

    const { tokens } = await client.getToken({
        code,
        redirect_uri: redirectUri,
    });

    if (!tokens.id_token) {
        throw new Error("Google did not return an ID token");
    }

    return verifyGoogleIdToken(tokens.id_token);
};

const findOrCreateGoogleUser = async (googleProfile, { linkOnly = false } = {}) => {
    const { googleId, email, name, profileImageUrl, isEmailVerified } = googleProfile;

    if (!isEmailVerified) {
        const error = new Error("Google email is not verified");
        error.statusCode = 403;
        throw error;
    }

    if (!email) {
        const error = new Error("Google account did not provide an email");
        error.statusCode = 400;
        throw error;
    }

    let user = await User.findOne({ googleId });

    if (user) {
        user.name = user.name || name;
        if (!user.profileImageUrl && profileImageUrl) {
            user.profileImageUrl = profileImageUrl;
        }
        user.isEmailVerified = true;
        await user.save();
        return { user, isNewUser: false, linked: false };
    }

    user = await User.findOne({ email });

    if (user) {
        if (user.googleId && user.googleId !== googleId) {
            const error = new Error("This email is linked to a different Google account");
            error.statusCode = 409;
            throw error;
        }

        user.googleId = googleId;
        user.isEmailVerified = true;
        if (!user.profileImageUrl && profileImageUrl) {
            user.profileImageUrl = profileImageUrl;
        }
        if (!user.name && name) {
            user.name = name;
        }
        await user.save();
        return { user, isNewUser: false, linked: true };
    }

    if (linkOnly) {
        const error = new Error("No account found to link with this Google account");
        error.statusCode = 404;
        throw error;
    }

    user = await User.create({
        name,
        email,
        provider: AUTH_PROVIDERS.GOOGLE,
        googleId,
        profileImageUrl,
        isEmailVerified: true,
    });

    return { user, isNewUser: true, linked: false };
};

module.exports = {
    verifyGoogleIdToken,
    exchangeAuthorizationCode,
    findOrCreateGoogleUser,
    getGoogleAuthUrl: () => {
        const client = getGoogleClient();
        const redirectUri =
            process.env.GOOGLE_CALLBACK_URL ||
            `${process.env.FRONTEND_URL || "http://localhost:8000"}/api/auth/google/callback`;

        return client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: ["openid", "email", "profile"],
            redirect_uri: redirectUri,
        });
    },
};
