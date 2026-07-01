/**
 * Maps internal language ids to Piston API language identifiers.
 * Internal: javascript | python | java | cpp
 */
const PISTON_RUNTIME_MAP = {
    javascript: { language: "javascript", version: "18.15.0", fileName: "main.js" },
    python: { language: "python", version: "3.10.0", fileName: "main.py" },
    java: { language: "java", version: "15.0.2", fileName: "Main.java" },
    cpp: { language: "c++", version: "10.2.0", fileName: "main.cpp" },
};

function getPistonRuntime(language) {
    return PISTON_RUNTIME_MAP[language] || null;
}

module.exports = {
    PISTON_RUNTIME_MAP,
    getPistonRuntime,
};
