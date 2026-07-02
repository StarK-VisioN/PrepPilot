const { AUTH_PROVIDERS } = require("../constants/authProviders");

const formatUserResponse = (user, token) => {
    const payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        avatar: user.profileImageUrl,
        provider: user.provider || "local",
        googleId: user.googleId || null,
        isEmailVerified: Boolean(user.isEmailVerified),
        role: user.role || "user",
        hasPassword: (user.provider || AUTH_PROVIDERS.LOCAL) !== AUTH_PROVIDERS.GOOGLE,
        createdAt: user.createdAt,
    };

    if (token) {
        payload.token = token;
    }

    return payload;
};

module.exports = formatUserResponse;
