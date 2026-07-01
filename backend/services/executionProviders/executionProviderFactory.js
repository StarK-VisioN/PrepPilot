const localJavascriptProvider = require("./localJavascriptProvider");
const { normalizeLanguage } = require("../../utils/codingLanguages");

const PROVIDER_ID = "local-js";

function resolveProviderId(language) {
    const normalizedLanguage = normalizeLanguage(language);
    if (!normalizedLanguage) {
        throw new Error(`Unsupported Language: ${language || "(missing)"}`);
    }
    return PROVIDER_ID;
}

function assertLanguageProvider(language, providerId) {
    const normalizedLanguage = normalizeLanguage(language);
    if (normalizedLanguage !== "javascript" || providerId !== PROVIDER_ID) {
        const error = new Error("Only the local JavaScript runner is supported");
        error.statusCode = 400;
        throw error;
    }
}

function getProvider(language) {
    const normalizedLanguage = normalizeLanguage(language);
    if (!normalizedLanguage) {
        throw new Error(`Unsupported Language: ${language || "(missing)"}`);
    }

    const providerId = resolveProviderId(normalizedLanguage);
    assertLanguageProvider(normalizedLanguage, providerId);

    return {
        providerId,
        provider: localJavascriptProvider,
        language: normalizedLanguage,
    };
}

async function checkRuntimeForLanguage(language) {
    const { provider } = getProvider(language);
    return provider.checkRuntime(language);
}

module.exports = {
    PROVIDER_ID,
    resolveProviderId,
    assertLanguageProvider,
    getProvider,
    checkRuntimeForLanguage,
};
