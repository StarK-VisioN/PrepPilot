const localJavascriptProvider = require("../executionProviders/localJavascriptProvider");

async function runTestCases(params) {
    return localJavascriptProvider.runTestCases({
        ...params,
        language: "javascript",
    });
}

module.exports = {
    runTestCases,
};
