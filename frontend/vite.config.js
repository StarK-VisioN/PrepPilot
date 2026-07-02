import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || 'https://prep-pilot-sssb.vercel.app').replace(/\/$/, '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-meta-inject',
        transformIndexHtml(html) {
          return html
            .replaceAll('__SITE_URL__', siteUrl)
            .replaceAll('__SITE_TITLE__', 'Interview Prep AI — Your Interview Prep, Tailored to You')
            .replaceAll(
              '__SITE_DESCRIPTION__',
              'AI-powered interview preparation: personalized Q&A from your resume or job description, coding practice, Behavioral feedback, mock interviews, and weakness analytics.'
            )
        },
      },
    ],
  }
})
