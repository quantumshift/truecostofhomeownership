import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://truecostofhomeownership.com';

// No disallow rules for AI/search crawlers (GPTBot, ClaudeBot, Claude-SearchBot,
// PerplexityBot, OAI-SearchBot, Google-Extended, etc.) — this site wants to be
// found and cited by both traditional search and AI answer engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
