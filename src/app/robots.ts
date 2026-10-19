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
          'Google-InspectionTool',
          'Perplexitybot',
          'ClaudeBot',
          'Applebot-Extended',
          'Bingbot',
          'Googlebot',
          'Googlebot-Image',
        ],
        allow: '/',
        disallow: ['/admin', '/admin/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
