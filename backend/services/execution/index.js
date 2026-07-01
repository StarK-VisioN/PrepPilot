const localJavascriptProvider = require("../executionProviders/localJavascriptProvider");
const { resolveExecutableLanguage } = require("../../utils/codingLanguages");

async function runTestCases(params) {
    const resolved = resolveExecutableLanguage(params.language);
    if (!resolved.ok) {
        throw new Error(resolved.message);
    }

    return localJavascriptProvider.runTestCases({
        ...params,
        language: resolved.language,
    });
}

module.exports = {
    runTestCases,
};
