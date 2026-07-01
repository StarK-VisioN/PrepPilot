const User = require("../models/User");
const {
    DEFAULT_CODING_LANGUAGE,
    normalizeLanguage,
} = require("../utils/codingLanguages");

async function getPreferredCodingLanguage(userId) {
    const user = await User.findById(userId).select("preferredCodingLanguage");
    if (!user) {
        return DEFAULT_CODING_LANGUAGE;
    }
    return normalizeLanguage(user.preferredCodingLanguage) || DEFAULT_CODING_LANGUAGE;
}

async function setPreferredCodingLanguage(userId, language) {
    const normalized = normalizeLanguage(language);
    if (!normalized) {
        throw new Error("Only JavaScript execution is supported in this version.");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { preferredCodingLanguage: normalized },
        { new: true, select: "preferredCodingLanguage" }
    );

    if (!user) {
        throw new Error("User not found");
    }

    return user.preferredCodingLanguage;
}

module.exports = {
    getPreferredCodingLanguage,
    setPreferredCodingLanguage,
};
