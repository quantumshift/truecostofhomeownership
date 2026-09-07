import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://truecostofhomeownership.com';

// Explicit, named allow rules for the AI answer-engine and search crawlers this site wants to
// be found and cited by, rather than relying on the wildcard rule below to cover them silently.
// OAI-SearchBot (ChatGPT's real-time search crawler) is a distinct user-agent from GPTBot
// (OpenAI's training crawler) — both need their own line here, since blocking OAI-SearchBot
// specifically would remove this page from ChatGPT's search results even with GPTBot allowed.
const AI_AND_SEARCH_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'Google-Extended',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_AND_SEARCH_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
