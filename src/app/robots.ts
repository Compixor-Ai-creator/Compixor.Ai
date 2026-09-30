import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: [
          'ChatGPT-User',
          'GPTBot',
          'Google-InspectionTool',
          'Perplexitybot',
          'ClaudeBot',
          'Applebot-Extended',
          'Bingbot',
          'Googlebot',
        ],
        allow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
