const SKILL_DICTIONARIES = {
    languages: [
        "Python", "JavaScript", "TypeScript", "Java", "Go", "Golang", "Rust",
        "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "SQL",
    ],
    frameworks: [
        "FastAPI", "Flask", "Django", "Django REST Framework", "DRF",
        "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express",
        "Spring Boot", "Laravel", "TensorFlow", "PyTorch", ".NET",
    ],
    databases: [
        "PostgreSQL", "MongoDB", "DocumentDB", "MySQL", "Redis", "SQLite",
        "DynamoDB", "Elasticsearch", "Cassandra", "MariaDB", "Oracle",
    ],
    cloud: [
        "AWS", "Azure", "GCP", "Google Cloud", "Lambda", "EC2", "S3",
        "CloudFront", "Azure DevOps", "CloudWatch",
    ],
    devops: [
        "Docker", "Kubernetes", "Jenkins", "CI/CD", "Terraform", "Git",
        "GitHub Actions", "GitLab", "Ansible", "Helm", "Nginx",
    ],
    concepts: [
        "REST APIs", "REST API", "GraphQL", "Authentication", "Authorization",
        "Microservices", "System Design", "Async Processing", "Queues",
        "Worker Systems", "Unit Testing", "Integration Testing",
        "Secure Coding", "API Design", "WebSockets", "OAuth", "JWT",
        "Message Queues", "Caching", "Load Balancing", "Agile", "Scrum",
    ],
};

const GENERIC_PHRASES = new Set([
    "experience", "strong", "hands-on", "deep", "knowledge", "understanding",
    "familiarity", "exposure", "skills", "years", "software", "engineering",
    "development", "general", "backend", "frontend", "full stack", "fullstack",
    "including", "design", "optimization", "workflows", "practices",
    "fundamentals", "systems", "services", "based", "deployments",
]);

const ALL_CANONICAL_SKILLS = Object.values(SKILL_DICTIONARIES)
    .flat()
    .sort((a, b) => b.length - a.length);

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isGenericPhrase(text) {
    return GENERIC_PHRASES.has(text.toLowerCase().trim());
}

function capitalizeSkill(text) {
    const trimmed = text.trim();
    if (!trimmed) return trimmed;
    return trimmed
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function normalizeKey(skill) {
    return skill.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Extract skill tags from description, topicsToFocus, or combined text.
 * Uses dictionary matching first, then comma-split fallback, then token heuristics.
 */
function extractSkills(input = "", options = {}) {
    const parts = [];
    if (typeof input === "string" && input.trim()) parts.push(input);
    if (options.topicsToFocus?.trim()) parts.push(options.topicsToFocus);
    if (options.description?.trim()) parts.push(options.description);

    const combined = parts.join(" ");
    if (!combined.trim()) return [];

    const found = new Map();

    for (const skill of ALL_CANONICAL_SKILLS) {
        const regex = new RegExp(`\\b${escapeRegex(skill)}\\b`, "i");
        if (regex.test(combined)) {
            const key = normalizeKey(skill);
            if (!found.has(key)) found.set(key, skill);
        }
    }

    const commaSource = options.topicsToFocus || input;
    commaSource
        .split(/[,;|\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 2 && s.length <= 45)
        .forEach((segment) => {
            const cleaned = segment
                .replace(/^[\d.]+\s*yrs?\s*/i, "")
                .replace(/^(strong|hands-on|deep|experience with)\s+/i, "")
                .trim();

            if (!cleaned || isGenericPhrase(cleaned)) return;

            const key = normalizeKey(cleaned);
            const dictMatch = ALL_CANONICAL_SKILLS.find(
                (s) => normalizeKey(s) === key
            );
            if (!found.has(key)) {
                found.set(key, dictMatch || capitalizeSkill(cleaned));
            }
        });

    const techPattern =
        /\b([A-Z][a-zA-Z0-9.+#/-]*(?:\s+(?:REST\s+)?[A-Z][a-zA-Z]+)*)\b/g;
    let match;
    while ((match = techPattern.exec(combined)) !== null) {
        const token = match[1].trim();
        if (token.length < 2 || token.length > 40 || isGenericPhrase(token)) continue;
        const key = normalizeKey(token);
        if (!found.has(key)) found.set(key, token);
    }

    return Array.from(found.values()).slice(0, 24);
}

module.exports = {
    SKILL_DICTIONARIES,
    extractSkills,
};
