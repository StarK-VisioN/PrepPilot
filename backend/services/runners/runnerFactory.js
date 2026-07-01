const javascriptRunner = require("./javascriptRunner");
const pythonRunner = require("./pythonRunner");
const javaRunner = require("./javaRunner");
const cppRunner = require("./cppRunner");
const { normalizeLanguage, getLanguageConfig } = require("../../utils/codingLanguages");

const RUNNERS = {
    javascript: javascriptRunner,
    python: pythonRunner,
    java: javaRunner,
    cpp: cppRunner,
};

function getRunner(language) {
    const normalized = normalizeLanguage(language);
    console.log("Execution language:", language);

    if (!normalized) {
        throw new Error(`Language not supported yet: ${language || "(missing)"}`);
    }

    const runner = RUNNERS[normalized];
    if (!runner) {
        throw new Error(`Language not supported yet: ${normalized}`);
    }

    const config = getLanguageConfig(normalized);
    return { runner, language: normalized, config };
}

module.exports = {
    getRunner,
    RUNNERS,
};
