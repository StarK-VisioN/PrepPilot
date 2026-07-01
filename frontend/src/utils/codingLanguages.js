export const DEFAULT_CODING_LANGUAGE = "javascript";

export const CODING_LANGUAGES = [
  { id: "javascript", label: "JavaScript", monacoId: "javascript", badge: "JS" },
];

export const PREFERRED_LANGUAGE_STORAGE_KEY = "codingPreferredLanguage";

export function normalizeCodingLanguage(_language) {
  return DEFAULT_CODING_LANGUAGE;
}

export function getCodingLanguage(_id) {
  return CODING_LANGUAGES[0];
}

export function normalizeStarterCode(starterCode) {
  if (!starterCode) return {};
  if (typeof starterCode === "string") {
    return { javascript: starterCode };
  }
  return starterCode;
}

export function getStarterForLanguage(starterCode) {
  const starters = normalizeStarterCode(starterCode);
  return starters.javascript || "";
}

export function resolveCodingRunError(error) {
  return error?.response?.data?.message || error?.message || "Failed to run code";
}

export function readStoredLanguagePreference() {
  return DEFAULT_CODING_LANGUAGE;
}

export function writeStoredLanguagePreference() {
  // JavaScript-only in this version
}
