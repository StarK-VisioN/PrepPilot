export const SITE_NAME = 'Interview Prep AI';

export const SITE_TITLE = 'Interview Prep AI — Your Interview Prep, Tailored to You';

export const SITE_DESCRIPTION =
  'AI-powered interview preparation: personalized Q&A from your resume or job description, coding practice, STAR behavioral feedback, mock interviews, and weakness analytics.';

export const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') || 'https://prep-pilot-sssb.vercel.app';

export const OG_IMAGE_PATH = '/interview_prep_ai.png';

export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;
