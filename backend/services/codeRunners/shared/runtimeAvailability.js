async function checkJavascriptRuntime() {
    return { available: true, message: null };
}

async function checkRuntime(language) {
    if (language === "javascript") {
        return checkJavascriptRuntime();
    }
    return { available: false, message: "Only JavaScript is supported in this version." };
}

async function checkAllRuntimes() {
    const result = await checkJavascriptRuntime();
    return {
        javascript: {
            available: result.available,
            message: result.message || null,
        },
    };
}

module.exports = {
    checkRuntime,
    checkAllRuntimes,
};
