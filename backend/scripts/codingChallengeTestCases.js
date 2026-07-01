/** Manual hidden/edge cases merged during seed (always applied, no Groq required). */
const MANUAL_EDGE_CASES_BY_SLUG = {
    "valid-parentheses": [
        { input: ["("], expected: false, type: "edge", isHidden: true, label: "Edge: unclosed (" },
        { input: ["(("], expected: false, type: "edge", isHidden: true, label: "Edge: double open" },
        { input: ["["], expected: false, type: "edge", isHidden: true, label: "Edge: unclosed [" },
        { input: ["{"], expected: false, type: "edge", isHidden: true, label: "Edge: unclosed {" },
        { input: ["(()"], expected: false, type: "edge", isHidden: true, label: "Edge: partial close" },
        { input: ["([{"], expected: false, type: "edge", isHidden: true, label: "Edge: mixed unclosed" },
        { input: ["([)]"], expected: false, type: "hidden", isHidden: true, label: "Hidden: wrong order" },
        { input: ["{[]}"], expected: true, type: "hidden", isHidden: true, label: "Hidden: nested valid" },
    ],
};

module.exports = {
    MANUAL_EDGE_CASES_BY_SLUG,
};
