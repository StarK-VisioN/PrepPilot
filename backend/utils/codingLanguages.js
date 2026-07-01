const DEFAULT_CODING_LANGUAGE = "javascript";

const SUPPORTED_LANGUAGES = [
    {
        id: "javascript",
        label: "JavaScript",
        monacoId: "javascript",
        extension: "js",
    },
];

const LANGUAGE_IDS = ["javascript"];

const UNSUPPORTED_LANGUAGE_MESSAGE =
    "Only JavaScript execution is supported in this version.";

function normalizeLanguage(language) {
    if (!language || typeof language !== "string") {
        return DEFAULT_CODING_LANGUAGE;
    }
    const normalized = language.trim().toLowerCase();
    if (normalized === "js" || normalized === "javascript") {
        return DEFAULT_CODING_LANGUAGE;
    }
    return null;
}

function resolveExecutableLanguage(rawLanguage) {
    if (!rawLanguage) {
        return { ok: true, language: DEFAULT_CODING_LANGUAGE };
    }

    const normalized = normalizeLanguage(rawLanguage);
    if (!normalized) {
        return { ok: false, message: UNSUPPORTED_LANGUAGE_MESSAGE };
    }
    return { ok: true, language: normalized };
}

function isSupportedLanguage(language) {
    return normalizeLanguage(language) === DEFAULT_CODING_LANGUAGE;
}

function getLanguageConfig(language) {
    return SUPPORTED_LANGUAGES.find((lang) => lang.id === language) || SUPPORTED_LANGUAGES[0];
}

function normalizeStarterCode(starterCode) {
    if (!starterCode) return {};
    if (typeof starterCode === "string") {
        return { javascript: starterCode };
    }
    if (starterCode instanceof Map) {
        return Object.fromEntries(starterCode.entries());
    }
    return { ...starterCode };
}

function getStarterForLanguage(starterCode, _language = DEFAULT_CODING_LANGUAGE) {
    const starters = normalizeStarterCode(starterCode);
    return starters.javascript || "";
}

function getFunctionNameForLanguage(challenge, _language = DEFAULT_CODING_LANGUAGE) {
    const names = normalizeStarterCode(challenge.functionNameByLanguage);
    return names.javascript || challenge.functionName;
}

module.exports = {
    DEFAULT_CODING_LANGUAGE,
    SUPPORTED_LANGUAGES,
    LANGUAGE_IDS,
    UNSUPPORTED_LANGUAGE_MESSAGE,
    normalizeLanguage,
    resolveExecutableLanguage,
    isSupportedLanguage,
    getLanguageConfig,
    normalizeStarterCode,
    getStarterForLanguage,
    getFunctionNameForLanguage,
};
