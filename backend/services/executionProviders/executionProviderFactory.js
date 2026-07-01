console.log("[TRACE] loaded file: services/executionProviders/executionProviderFactory.js");

const pistonExecutionProvider = require("./pistonExecutionProvider");
const localJavascriptProvider = require("./localJavascriptProvider");
const { normalizeLanguage } = require("../../utils/codingLanguages");

const PROVIDERS = {
    piston: pistonExecutionProvider,
    "local-js": localJavascriptProvider,
};

function getGlobalProviderOverride(language) {
    const override =
        process.env.CODE_EXECUTION_PROVIDER || process.env.CODING_EXECUTION_PROVIDER;
    if (!override) {
        return null;
    }
    const normalized = override.trim().toLowerCase();
    if (normalized === "piston") {
        return "piston";
    }
    if ((normalized === "local" || normalized === "local-js") && language === "javascript") {
        return "local-js";
    }
    return null;
}

function resolveProviderId(language) {
    const normalizedLanguage = normalizeLanguage(language);
    if (!normalizedLanguage) {
        throw new Error(`Unsupported Language: ${language || "(missing)"}`);
    }

    const globalOverride = getGlobalProviderOverride(normalizedLanguage);
    if (globalOverride) {
        return globalOverride;
    }

    if (normalizedLanguage === "javascript") {
        if (String(process.env.LOCAL_JS_RUNNER_ENABLED || "").toLowerCase() === "false") {
            return "piston";
        }
        return "local-js";
    }

    return "piston";
}

function assertLanguageProvider(language, providerId) {
    const normalizedLanguage = normalizeLanguage(language);
    if (normalizedLanguage !== "javascript" && providerId === "local-js") {
        const error = new Error("BUG: Non-JavaScript language reached JavaScript runner");
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

    const provider = PROVIDERS[providerId];
    if (!provider) {
        throw new Error(`Unknown execution provider: ${providerId}`);
    }

    return {
        providerId,
        provider,
        language: normalizedLanguage,
    };
}

async function checkRuntimeForLanguage(language) {
    const { providerId, provider } = getProvider(language);
    if (providerId === "piston") {
        return provider.checkRuntime(language);
    }
    return provider.checkRuntime(language);
}

module.exports = {
    PROVIDERS,
    resolveProviderId,
    assertLanguageProvider,
    getProvider,
    checkRuntimeForLanguage,
};
