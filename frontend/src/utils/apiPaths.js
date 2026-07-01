export const BASE_URL =
    import.meta.env.VITE_APP_BACKEND_URL ||
    (import.meta.env.DEV ? "http://localhost:8000" : "");

export const API_PATHS = {
    AUTH: {
        REGISTER: `${BASE_URL}/api/auth/register`,
        LOGIN: `${BASE_URL}/api/auth/login`,
        GET_PROFILE: `${BASE_URL}/api/auth/profile`,
    },

    IMAGE: {
        UPLOAD_IMAGE: `${BASE_URL}/api/auth/upload-image`,
    },

    AI: {
        GENERATE_QUESTIONS: `${BASE_URL}/api/ai/generate-questions`,
        GENERATE_EXPLANATION: `${BASE_URL}/api/ai/generate-explanation`,
        GENERATE_TOPIC_QUESTIONS: `${BASE_URL}/api/ai/generate-topic-questions`,
    },

    DOCUMENTS: {
        UPLOAD_RESUME: `${BASE_URL}/api/documents/resume/upload`,
        UPLOAD_JD: `${BASE_URL}/api/documents/jd/upload`,
        PASTE_JD: `${BASE_URL}/api/documents/jd/paste`,
        GET_ONE: (id) => `${BASE_URL}/api/documents/${id}`,
    },

    COMPANIES: {
        GET_ALL: `${BASE_URL}/api/companies`,
    },

    SESSION: {
        CREATE: `${BASE_URL}/api/sessions/create`,
        GET_ALL: `${BASE_URL}/api/sessions/my-sessions`,
        GET_ONE: (id) => `${BASE_URL}/api/sessions/${id}`,
        UPDATE_CUSTOM_SKILLS: (id) => `${BASE_URL}/api/sessions/${id}/custom-skills`,
        DELETE_TOPIC_QUESTIONS: (id, topic) =>
            `${BASE_URL}/api/sessions/${id}/topic-questions/${encodeURIComponent(topic)}`,
        DELETE: (id) => `${BASE_URL}/api/sessions/${id}`,
    },

    QUESTION: {
        ADD_TO_SESSION: `${BASE_URL}/api/questions/add`,
        PIN: (id) => `${BASE_URL}/api/questions/${id}/pin`,
        UPDATE_NOTE: (id) => `${BASE_URL}/api/questions/${id}/note`,
    },

    CODING: {
        LANGUAGES: `${BASE_URL}/api/coding/languages`,
        RUNTIMES: `${BASE_URL}/api/coding/runtimes`,
        PREFERENCES: `${BASE_URL}/api/coding/preferences`,
        CHALLENGES: `${BASE_URL}/api/coding/challenges`,
        CHALLENGE_BY_ID: (id) => `${BASE_URL}/api/coding/challenges/${id}`,
        CHALLENGE_BY_SLUG: (slug) => `${BASE_URL}/api/coding/challenges/slug/${slug}`,
        RUN: `${BASE_URL}/api/coding/run`,
        SUBMIT: `${BASE_URL}/api/coding/submit`,
        SUBMISSIONS: (challengeId) => `${BASE_URL}/api/coding/submissions/${challengeId}`,
        GET_DRAFT: (challengeId) => `${BASE_URL}/api/coding/draft/${challengeId}`,
        SAVE_DRAFT: (challengeId) => `${BASE_URL}/api/coding/draft/${challengeId}`,
    },

    BEHAVIORAL: {
        QUESTIONS: `${BASE_URL}/api/behavioral/questions`,
        QUESTION_BY_ID: (id) => `${BASE_URL}/api/behavioral/questions/${id}`,
        SUBMIT: `${BASE_URL}/api/behavioral/submit`,
        HISTORY: `${BASE_URL}/api/behavioral/history`,
        STATS: `${BASE_URL}/api/behavioral/stats`,
    },

    MOCK_INTERVIEW: {
        CONFIG: `${BASE_URL}/api/mock-interview/config`,
        START: `${BASE_URL}/api/mock-interview/start`,
        MESSAGE: `${BASE_URL}/api/mock-interview/message`,
        END: `${BASE_URL}/api/mock-interview/end`,
        SESSION: (id) => `${BASE_URL}/api/mock-interview/session/${id}`,
        REPORT: (id) => `${BASE_URL}/api/mock-interview/report/${id}`,
        HISTORY: `${BASE_URL}/api/mock-interview/history`,
    },

    ANALYTICS: {
        DASHBOARD: `${BASE_URL}/api/analytics/dashboard`,
        TOPICS: `${BASE_URL}/api/analytics/topics`,
        ROADMAP: `${BASE_URL}/api/analytics/roadmap`,
        RECOMMENDATIONS: `${BASE_URL}/api/analytics/recommendations`,
        GOALS: `${BASE_URL}/api/analytics/goals`,
        HISTORY: `${BASE_URL}/api/analytics/history`,
    },
};

/** Supports legacy array responses and new { questions, meta } shape */
export function extractGeneratedQuestions(responseData) {
    if (Array.isArray(responseData)) {
        return { questions: responseData, meta: null };
    }
    return {
        questions: responseData?.questions || [],
        meta: responseData?.meta || null,
    };
}

export function buildTopicsFromExtracted(extractedData) {
    if (!extractedData) return '';
    const parts = [
        ...(extractedData.skills || []),
        ...(extractedData.technologies || []),
    ];
    return [...new Set(parts.map((p) => p.trim()).filter(Boolean))].join(', ');
}
