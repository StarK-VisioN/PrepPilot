console.log("[TRACE] loaded file: services/codeRunners/runnerFactory.js");

const { getProvider } = require("../executionProviders/executionProviderFactory");
const { normalizeLanguage } = require("../../utils/codingLanguages");

const RUNNERS = {};

function getRunner(language) {
    const normalized = normalizeLanguage(language);

    console.log("[RUNNER FACTORY] getRunner called — language:", language, "->", normalized || "invalid");
    console.warn("[RUNNER FACTORY] STALE: getRunner() is deprecated; use executionProviders instead");

    if (!normalized) {
        throw new Error(`Language not supported yet: ${language || "(missing)"}`);
    }

    const { providerId, provider } = getProvider(normalized);

    if (providerId !== "local-js") {
        throw new Error(
            `BUG: runnerFactory.getRunner("${normalized}") resolved to "${providerId}" — use piston provider directly`
        );
    }

    return { runner: provider, language: normalized };
}

module.exports = {
    getRunner,
    RUNNERS,
};
