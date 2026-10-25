import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/'],
      },
      {
        userAgent: [
          'ChatGPT-User',
          'GPTBot',
          'OAI-SearchBot',
          'Google-InspectionTool',
          'Google-Extended',
          'Googlebot',
          'Googlebot-Image',
          'Bingbot',
          'Perplexitybot',
          'ClaudeBot',
          'Applebot',
          'Applebot-Extended',
          'cohere-ai',
          'CCBot',
        ],
        allow: '/',
        disallow: ['/admin', '/admin/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
