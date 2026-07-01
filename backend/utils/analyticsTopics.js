/** Maps raw tags/labels to normalized analytics topics */
const TAG_TO_TOPIC = {
    Array: "Arrays",
    "Hash Table": "Arrays",
    String: "Strings",
    "Two Pointers": "Arrays",
    "Binary Search": "Arrays",
    "Dynamic Programming": "Dynamic Programming",
    "Linked List": "Linked Lists",
    Tree: "Trees",
    Graph: "Graphs",
    Stack: "Stack & Queue",
    Queue: "Stack & Queue",
    "Prefix Sum": "Arrays",
    Math: "Problem Solving",
    Simulation: "Problem Solving",
    Sorting: "Arrays",
    "Divide and Conquer": "Problem Solving",
    Memoization: "Dynamic Programming",
    "Bit Manipulation": "Problem Solving",
    Design: "System Design",
    JavaScript: "JavaScript",
    React: "React",
    "Node.js": "Node.js",
    Docker: "Docker",
    Redis: "Redis",
    SQL: "SQL",
    Database: "Database",
    Networking: "Networking",
    OOP: "OOP",
    OS: "Operating Systems",
};

const BEHAVIORAL_TOPICS = [
    "Leadership",
    "Conflict Resolution",
    "Teamwork",
    "Ownership",
    "Failure & Learning",
    "Communication",
    "Problem Solving",
    "Time Management",
    "Adaptability",
    "Customer Obsession",
    "Project Management",
    "Decision Making",
];

const MOCK_DIMENSION_TOPICS = {
    communication: "Communication",
    technicalKnowledge: "Technical Depth",
    problemSolving: "Problem Solving",
    confidence: "Confidence",
    clarity: "Clarity",
    correctness: "Correctness",
    depth: "Technical Depth",
    systemDesign: "System Design",
    tradeoffThinking: "Tradeoff Thinking",
    scalabilityUnderstanding: "Scalability",
    starSituation: "STAR Responses",
    starTask: "STAR Responses",
    starAction: "STAR Responses",
    starResult: "STAR Responses",
};

const ROADMAP_WEEKS = [
    { week: 1, topics: ["Arrays", "Strings"] },
    { week: 2, topics: ["Linked Lists", "Stack & Queue"] },
    { week: 3, topics: ["Trees", "Graphs"] },
    { week: 4, topics: ["Dynamic Programming", "System Design"] },
];

function normalizeTopic(raw) {
    if (!raw || typeof raw !== "string") return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (TAG_TO_TOPIC[trimmed]) return TAG_TO_TOPIC[trimmed];
    const found = Object.keys(TAG_TO_TOPIC).find(
        (k) => k.toLowerCase() === trimmed.toLowerCase()
    );
    if (found) return TAG_TO_TOPIC[found];
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function parseTopicsFromString(str) {
    if (!str || typeof str !== "string") return [];
    return [...new Set(str.split(/[,;|]/).map(normalizeTopic).filter(Boolean))];
}

function getReadinessLabel(score) {
    if (score >= 85) return "FAANG Ready";
    if (score >= 70) return "Interview Ready";
    if (score >= 45) return "Intermediate";
    return "Beginner";
}

module.exports = {
    TAG_TO_TOPIC,
    BEHAVIORAL_TOPICS,
    MOCK_DIMENSION_TOPICS,
    ROADMAP_WEEKS,
    normalizeTopic,
    parseTopicsFromString,
    getReadinessLabel,
};
