export const QUESTION_GENERATION_ERROR_MESSAGE =
  "Sorry, we couldn't generate the set of questions! Please try again.";

const TECHNICAL_QUESTION_GEN_PATTERNS = [
  'invalid response',
  'invalid format',
  'ai returned invalid',
  'no topic questions',
  'could not generate questions',
  'no new unique questions',
  'no questions were generated',
  'failed to parse',
];

const TECHNICAL_RATE_LIMIT_MARKERS = [
  'rate_limit_exceeded',
  'rate limit reached',
  'tokens per day',
  'tokens per minute',
  'llama-3.3',
  'org_',
  'service tier',
  'groq.com',
];

function extractErrorText(error) {
  const data = error?.response?.data;
  if (data?.message && typeof data.message === 'string') return data.message;
  if (data?.error && typeof data.error === 'string') return data.error;
  return error?.message || '';
}

function parseWaitTimeFromText(text) {
  const match = text.match(/try again in\s+(?:(\d+)m)?(\d+(?:\.\d+)?)s/i);
  if (!match) return null;
  const minutes = parseInt(match[1] || '0', 10);
  const seconds = parseFloat(match[2] || '0');
  return Math.ceil(minutes * 60 + seconds);
}

function formatWaitText(seconds) {
  if (!seconds) return 'a few minutes';
  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return `about ${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  return `${seconds} seconds`;
}

function isTechnicalRateLimitMessage(text) {
  const lower = text.toLowerCase();
  return TECHNICAL_RATE_LIMIT_MARKERS.some((marker) => lower.includes(marker));
}

function isRateLimitError(error) {
  const status = error?.response?.status;
  const text = extractErrorText(error).toLowerCase();
  return status === 429 || status === 503 || isTechnicalRateLimitMessage(text);
}

/**
 * User-friendly message for Groq / API rate limits (429, 503).
 */
export function resolveRateLimitErrorMessage(error) {
  if (!isRateLimitError(error)) return null;

  const status = error?.response?.status;
  const data = error?.response?.data;
  const raw = extractErrorText(error);
  const waitSeconds = data?.retryAfter || parseWaitTimeFromText(raw);
  const waitText = formatWaitText(waitSeconds);

  // Backend already sent a clean message
  if (data?.message && !isTechnicalRateLimitMessage(data.message)) {
    return data.message;
  }

  if (/tokens per day|\btpd\b/i.test(raw)) {
    return `You've reached today's question limit. Please try again in ${waitText}.`;
  }

  if (/tokens per minute|\btpm\b|requests per minute|\brpm\b/i.test(raw)) {
    return `Too many requests right now. Please wait ${waitText} and try again.`;
  }

  return `We're a bit busy right now. Please wait ${waitText} and try again.`;
}

/**
 * Maps API/client errors to user-friendly messages for question generation.
 */
export function resolveQuestionGenerationErrorMessage(error, fallback) {
  const rateLimit = resolveRateLimitErrorMessage(error);
  if (rateLimit) return rateLimit;

  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status === 401) {
    return data?.message || 'Please sign in to continue.';
  }

  if (status === 422 && data?.isRetryable) {
    return QUESTION_GENERATION_ERROR_MESSAGE;
  }

  const msg = (data?.message || error?.message || '').toLowerCase();
  if (TECHNICAL_QUESTION_GEN_PATTERNS.some((pattern) => msg.includes(pattern))) {
    return QUESTION_GENERATION_ERROR_MESSAGE;
  }

  if (error?.message === 'Invalid response from AI service') {
    return QUESTION_GENERATION_ERROR_MESSAGE;
  }

  if (isTechnicalRateLimitMessage(extractErrorText(error))) {
    return resolveRateLimitErrorMessage(error);
  }

  return data?.message || error?.message || fallback || QUESTION_GENERATION_ERROR_MESSAGE;
}
