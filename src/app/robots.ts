import { MetadataRoute } from 'next';

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
    sitemap: 'https://compixor-ai.vercel.app/sitemap.xml',
  };
}
