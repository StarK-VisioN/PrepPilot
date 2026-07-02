export const SESSION_SOURCE_CONFIG = {
    jd: {
        label: 'Job Description',
        sectionTitle: 'From Job Description',
        sectionHint: 'Created by pasting or uploading a job description',
        ribbonClass: 'bg-blue-600 text-white',
        borderClass: 'border-l-blue-500',
        headerBg: 'linear-gradient(135deg, #bfdbfe 0%, #eff6ff 100%)',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    resume: {
        label: 'Resume',
        sectionTitle: 'From Resume',
        sectionHint: 'Created from your uploaded resume',
        ribbonClass: 'bg-emerald-600 text-white',
        borderClass: 'border-l-emerald-500',
        headerBg: 'linear-gradient(135deg, #a7f3d0 0%, #ecfdf5 100%)',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    combined: {
        label: 'Resume + JD',
        sectionTitle: 'From Resume & Job Description',
        sectionHint: 'Matched your resume against a job description',
        ribbonClass: 'bg-violet-600 text-white',
        borderClass: 'border-l-violet-500',
        headerBg: 'linear-gradient(135deg, #ddd6fe 0%, #f5f3ff 100%)',
        badgeClass: 'bg-violet-50 text-violet-800 border-violet-200',
    },
    manual: {
        label: 'Manual',
        sectionTitle: 'Manual Prep',
        sectionHint: 'Created with role, experience, and topics you entered',
        ribbonClass: 'bg-orange-500 text-white',
        borderClass: 'border-l-orange-400',
        headerBg: 'linear-gradient(135deg, #fed7aa 0%, #fff7ed 100%)',
        badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
    },
};

export const SESSION_SECTION_ORDER = ['jd', 'resume', 'combined', 'manual'];

export const COMPANY_LABELS = {
    generic: 'Generic',
    google: 'Google',
    amazon: 'Amazon',
    microsoft: 'Microsoft',
    netflix: 'Netflix',
    uber: 'Uber',
    startup: 'Startup',
    custom: 'Custom',
};

export function getCompanyDisplayName(company, customCompanyName) {
    if (company === 'custom' && customCompanyName?.trim()) {
        return customCompanyName.trim();
    }
    return COMPANY_LABELS[company] || company;
}

export function getSessionSourceConfig(sourceType) {
    return SESSION_SOURCE_CONFIG[sourceType] || SESSION_SOURCE_CONFIG.manual;
}

export function groupSessionsBySource(sessions) {
    return SESSION_SECTION_ORDER.map((type) => ({
        type,
        config: SESSION_SOURCE_CONFIG[type],
        sessions: sessions.filter((s) => (s.sourceType || 'manual') === type),
    })).filter((group) => group.sessions.length > 0);
}

export const CARD_BG = [
    { id: 1, bgcolor: 'linear-gradient(135deg, #e6f8f3 0%, #f7fcfa 100%)' },
    { id: 2, bgcolor: 'linear-gradient(135deg, #fefcea 0%, #f1da36 100%)' },
    { id: 3, bgcolor: 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)' },
    { id: 4, bgcolor: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
    { id: 5, bgcolor: 'linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)' },
    { id: 6, bgcolor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { id: 7, bgcolor: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
    { id: 8, bgcolor: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
    { id: 9, bgcolor: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
    { id: 10, bgcolor: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)' },
];


export const PHASE1_FEATURES = [
    {
        id: 'jd',
        title: 'Job Description Prep',
        description: 'Paste or upload a JD. We extract skills and requirements, then generate questions tailored to that role.',
        cta: 'Prep from JD',
        mode: 'jd',
        icon: 'jd',
        badge: 'New',
        gradient: 'from-blue-500 to-indigo-600',
    },
    {
        id: 'resume',
        title: 'Resume-Based Questions',
        description: 'Upload your resume and get questions on your actual stack - Docker, Redis, Next.js, and everything you list.',
        cta: 'Prep from Resume',
        mode: 'resume',
        icon: 'resume',
        badge: 'New',
        gradient: 'from-emerald-500 to-teal-600',
    },
    {
        id: 'company',
        title: 'Company-Specific Style',
        description: 'Practice like it\'s the real interview - Amazon LP, Google depth, startup hands-on, and more.',
        cta: 'Choose Company',
        mode: 'manual',
        icon: 'company',
        badge: 'New',
        gradient: 'from-violet-500 to-purple-600',
        highlightCompany: true,
    },
    {
        id: 'manual',
        title: 'Classic Role Prep',
        description: 'Pick your role, experience, and topics. Get AI-generated Q&A plus deep concept explanations.',
        cta: 'Start Manual Prep',
        mode: 'manual',
        icon: 'manual',
        badge: null,
        gradient: 'from-orange-500 to-amber-600',
    },
];

export const PHASE2_FEATURES = [
    {
        id: 'coding',
        title: 'Coding Round Simulator',
        description:
            'Practice in JavaScript with a Monaco editor, test cases, submissions, and draft autosave.',
        cta: 'Start Coding Practice',
        icon: 'coding',
        badge: 'New',
        gradient: 'from-slate-700 to-slate-900',
    },
];

export const PHASE3_FEATURES = [
    {
        id: 'behavioral',
        title: 'STAR Behavioral Eval',
        description:
            'Practice behavioral questions and get AI feedback scored on Situation, Task, Action, and Result.',
        cta: 'Start Behavioral Practice',
        icon: 'behavioral',
        badge: 'New',
        gradient: 'from-indigo-600 to-purple-700',
    },
];

export const PHASE4_FEATURES = [
    {
        id: 'mock-interview',
        title: 'AI Mock Interview',
        description:
            'Live chat-based mock interviews with dynamic AI follow-ups, personalities, and detailed feedback reports.',
        cta: 'Start Mock Interview',
        icon: 'mock-interview',
        badge: 'New',
        gradient: 'from-violet-600 to-purple-700',
    },
];

export const PHASE5_FEATURES = [
    {
        id: 'analytics',
        title: 'Weakness Analytics',
        description:
            'Track weak topics, readiness scores, and get a personalized learning roadmap across all modules.',
        cta: 'View Analytics',
        icon: 'analytics',
        badge: 'New',
        gradient: 'from-cyan-500 to-indigo-600',
    },
];

export const COMING_SOON_FEATURES = [];

export const APP_FEATURES = [
    {
        id: '01',
        title: 'AI-Generated Q&A',
        description: 'Get interview questions and model answers tuned to your role, experience, and focus areas.',
    },
    {
        id: '02',
        title: 'Concept Deep Dives',
        description: 'Tap Learn More on any question for an AI-powered explanation with examples.',
    },
    {
        id: '03',
        title: 'Session Management',
        description: 'Organize prep sessions, pin important questions, and load more anytime.',
    },
];