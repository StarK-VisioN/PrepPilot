const COMPANIES = [
    {
        id: "generic",
        name: "Generic",
        description: "Balanced mix of technical and behavioral questions.",
    },
    {
        id: "google",
        name: "Google",
        description: "Deep technical questions, algorithms, and system design thinking.",
    },
    {
        id: "amazon",
        name: "Amazon",
        description: "Leadership Principles and behavioral STAR-style questions.",
    },
    {
        id: "microsoft",
        name: "Microsoft",
        description: "Technical depth with collaboration and problem-solving focus.",
    },
    {
        id: "netflix",
        name: "Netflix",
        description: "High ownership, culture fit, and senior-level judgment questions.",
    },
    {
        id: "uber",
        name: "Uber",
        description: "Practical engineering, scalability, and product-minded questions.",
    },
    {
        id: "startup",
        name: "Startup",
        description: "Hands-on, practical, and full-stack oriented questions.",
    },
    {
        id: "custom",
        name: "Other (enter your own)",
        description: "Type any company name — questions will be tailored to it.",
    },
];

const COMPANY_PROMPT_STYLES = {
    generic: "Use a balanced interview style mixing technical depth and behavioral questions.",
    google: "Emulate Google interviews: deep technical questions, algorithmic thinking, scalability, and system design concepts. Ask follow-up style probing questions.",
    amazon: "Emulate Amazon interviews: focus on Leadership Principles (Customer Obsession, Ownership, Invent and Simplify, Bias for Action, etc.) with behavioral STAR-style scenarios.",
    microsoft: "Emulate Microsoft interviews: solid technical fundamentals, problem decomposition, collaboration, and growth mindset.",
    netflix: "Emulate Netflix interviews: high ownership, culture of freedom and responsibility, judgment under ambiguity, and senior-level decision making.",
    uber: "Emulate Uber interviews: practical engineering, real-world trade-offs, scalability, and product impact.",
    startup: "Emulate startup interviews: hands-on, practical, full-stack thinking, shipping fast, and wearing multiple hats.",
    custom: "Tailor questions for the specific company name provided by the candidate.",
};

const VALID_COMPANY_IDS = COMPANIES.map((c) => c.id);

function getCompanyStyle(companyId, customCompanyName = "") {
    if (companyId === "custom") {
        const name = customCompanyName?.trim();
        if (name) {
            return `Tailor questions as if the candidate is interviewing at ${name}. Mix technical depth, behavioral questions, and role-specific scenarios that ${name} would likely ask. Consider the company's industry, scale, and typical hiring bar when phrasing questions.`;
        }
        return COMPANY_PROMPT_STYLES.generic;
    }
    return COMPANY_PROMPT_STYLES[companyId] || COMPANY_PROMPT_STYLES.generic;
}

function normalizeCompanyId(companyId) {
    if (!companyId) return "generic";
    const normalized = companyId.toLowerCase().trim();
    if (normalized === "custom") return "custom";
    return VALID_COMPANY_IDS.includes(normalized) ? normalized : "generic";
}

function resolveCompanyFields(companyId, customCompanyName = "") {
    const company = normalizeCompanyId(companyId);
    const trimmedName = customCompanyName?.trim() || "";

    if (company === "custom") {
        return {
            company: "custom",
            customCompanyName: trimmedName,
        };
    }

    return {
        company,
        customCompanyName: "",
    };
}

module.exports = {
    COMPANIES,
    COMPANY_PROMPT_STYLES,
    VALID_COMPANY_IDS,
    getCompanyStyle,
    normalizeCompanyId,
    resolveCompanyFields,
};
