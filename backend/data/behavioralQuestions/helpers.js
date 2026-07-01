const BEHAVIORAL_CATEGORIES = [
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

const DEFAULT_HINTS = [
    "Set the Situation: where were you, what was the context?",
    "Define your Task: what were you responsible for?",
    "Describe your Actions: what specific steps did you take?",
    "Share the Result: what was the measurable outcome?",
];

const DEFAULT_SAMPLE =
    "In my previous role at [Company], I faced [situation]. My responsibility was [task]. I took these actions: [specific steps]. As a result, [quantifiable outcome].";

function createBehavioralQuestion({
    title,
    question,
    category,
    difficulty = "Medium",
    hints = DEFAULT_HINTS,
    sampleAnswer = DEFAULT_SAMPLE,
    tags = [],
    companyTags = [],
    order = 0,
}) {
    if (!title || !question || !category) {
        throw new Error(`Invalid behavioral question: ${title || "unknown"}`);
    }
    if (!BEHAVIORAL_CATEGORIES.includes(category)) {
        throw new Error(`Invalid category "${category}" for question: ${title}`);
    }

    return {
        title,
        question,
        category,
        difficulty,
        hints,
        sampleAnswer,
        tags,
        companyTags,
        order,
        isActive: true,
    };
}

function slugifyTitle(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);
}

module.exports = {
    BEHAVIORAL_CATEGORIES,
    DEFAULT_HINTS,
    DEFAULT_SAMPLE,
    createBehavioralQuestion,
    slugifyTitle,
};
