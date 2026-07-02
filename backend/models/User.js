const mongoose = require("mongoose");
const { AUTH_PROVIDER_VALUES, AUTH_PROVIDERS } = require("../constants/authProviders");

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: {
            type: String,
            required: function requiredPassword() {
                return (
                    !this.googleId &&
                    (this.provider === AUTH_PROVIDERS.LOCAL || !this.provider)
                );
            },
        },
        profileImageUrl: { type: String, default: null },
        avatarCloudinaryPublicId: { type: String, default: null },
        provider: {
            type: String,
            enum: AUTH_PROVIDER_VALUES,
            default: AUTH_PROVIDERS.LOCAL,
        },
        googleId: { type: String, sparse: true, unique: true, default: null },
        isEmailVerified: { type: Boolean, default: false },
        role: { type: String, default: "user" },
        preferredCodingLanguage: {
            type: String,
            enum: ["javascript"],
            default: "javascript",
        },
        resetPasswordToken: { type: String, default: null, select: false },
        resetPasswordExpires: { type: Date, default: null, select: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
